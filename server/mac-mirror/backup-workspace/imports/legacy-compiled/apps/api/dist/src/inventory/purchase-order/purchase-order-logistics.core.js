"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PurchaseOrderLogisticsCore_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderLogisticsCore = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const kuaidi100_client_1 = require("./kuaidi100.client");
const AUTO_REFRESH_EVERY_MS = 30 * 60_000;
const AUTO_REFRESH_MAX_AGE_DAYS = 45;
let PurchaseOrderLogisticsCore = PurchaseOrderLogisticsCore_1 = class PurchaseOrderLogisticsCore {
    prisma;
    client;
    logger = new common_1.Logger(PurchaseOrderLogisticsCore_1.name);
    timer = null;
    constructor(prisma, client) {
        this.prisma = prisma;
        this.client = client;
    }
    onModuleInit() {
        if (process.env.NODE_ENV === 'test' || !this.client.isConfigured())
            return;
        this.timer = setInterval(() => void this.autoRefresh(), AUTO_REFRESH_EVERY_MS);
        this.timer.unref?.();
        this.logger.log('快递100 物流自动刷新已开启（每 30 分钟）');
    }
    onModuleDestroy() {
        if (this.timer)
            clearInterval(this.timer);
    }
    async refreshOrder(id, throwOnError) {
        const o = await this.prisma.purchaseOrder.findUniqueOrThrow({ where: { id } });
        if (!o.expressNo || !o.expressCompany)
            throw new common_1.BadRequestException('请先填写快递公司和快递单号');
        try {
            const r = await this.client.query(o.expressCompany, o.expressNo, o.expressPhoneTail);
            const updated = await this.prisma.purchaseOrder.update({
                where: { id },
                data: { logisticsState: r.state, logisticsTrace: r.events, logisticsCheckedAt: new Date(), logisticsError: null },
            });
            return this.view(updated);
        }
        catch (e) {
            const msg = (e.message ?? '查询失败').slice(0, 250);
            await this.prisma.purchaseOrder.update({ where: { id }, data: { logisticsCheckedAt: new Date(), logisticsError: msg } });
            if (throwOnError)
                throw e;
            return this.view(await this.prisma.purchaseOrder.findUniqueOrThrow({ where: { id } }));
        }
    }
    async autoRefresh() {
        const since = new Date(Date.now() - AUTO_REFRESH_MAX_AGE_DAYS * 86_400_000);
        const rows = await this.prisma.purchaseOrder.findMany({
            where: { status: 'PURCHASED', expressNo: { not: null }, expressCompany: { not: null }, purchasedAt: { gte: since }, OR: [{ logisticsState: null }, { logisticsState: { notIn: kuaidi100_client_1.LOGISTICS_FINAL_STATES } }] },
            select: { id: true },
            take: 200,
        });
        let n = 0;
        const ships = await this.prisma.purchaseOrderShipment.findMany({
            where: { expressNo: { not: '' }, expressCompany: { not: null }, createdAt: { gte: since }, OR: [{ logisticsState: null }, { logisticsState: { notIn: kuaidi100_client_1.LOGISTICS_FINAL_STATES } }] },
            select: { id: true },
            take: 300,
        });
        n += await this.refreshShipments(ships.map((x) => x.id));
        for (const r of rows) {
            try {
                await this.refreshOrder(r.id, false);
                n += 1;
            }
            catch (e) {
                this.logger.warn(`自动刷新物流失败 ${r.id}：${e.message}`);
            }
            if (process.env.NODE_ENV !== 'test')
                await new Promise((res) => setTimeout(res, 1000));
        }
        return n;
    }
    async refreshShipment(id, throwOnError) {
        const sh = await this.prisma.purchaseOrderShipment.findUniqueOrThrow({ where: { id } });
        if (!sh.expressNo || !sh.expressCompany)
            throw new common_1.BadRequestException('这笔订单还没有快递公司或运单号');
        try {
            const r = await this.client.query(sh.expressCompany, sh.expressNo, null);
            return this.shipmentView(await this.prisma.purchaseOrderShipment.update({
                where: { id },
                data: { logisticsState: r.state, logisticsTrace: r.events, logisticsCheckedAt: new Date(), logisticsError: null },
            }));
        }
        catch (e) {
            const msg = (e.message ?? '查询失败').slice(0, 250);
            const upd = await this.prisma.purchaseOrderShipment.update({ where: { id }, data: { logisticsCheckedAt: new Date(), logisticsError: msg } });
            if (throwOnError)
                throw e;
            return this.shipmentView(upd);
        }
    }
    async refreshShipments(ids) {
        let n = 0;
        for (const id of ids) {
            try {
                await this.refreshShipment(id, true);
                n += 1;
            }
            catch (e) {
                this.logger.warn(`刷新平台订单物流失败 ${id}：${e.message}`);
            }
            if (process.env.NODE_ENV !== 'test')
                await new Promise((res) => setTimeout(res, 1000));
        }
        return n;
    }
    shipmentView(sh) {
        return {
            id: sh.id,
            platform: sh.platform,
            platformOrderNo: sh.platformOrderNo,
            sellerName: sh.sellerName,
            goodsTitle: sh.goodsTitle,
            amount: sh.amount,
            orderStatus: sh.orderStatus,
            expressCompany: sh.expressCompany,
            expressCompanyName: kuaidi100_client_1.EXPRESS_COMPANIES.find((c) => c.code === sh.expressCompany)?.name ?? sh.expressCompany,
            expressNo: sh.expressNo,
            logisticsState: sh.logisticsState,
            logisticsStateLabel: sh.logisticsState === null ? null : (kuaidi100_client_1.LOGISTICS_STATE_LABEL[sh.logisticsState] ?? `状态${sh.logisticsState}`),
            trace: Array.isArray(sh.logisticsTrace) ? sh.logisticsTrace : [],
            checkedAt: sh.logisticsCheckedAt,
            error: sh.logisticsError,
        };
    }
    view(o) {
        return {
            id: o.id,
            platform: o.platform,
            platformOrderNo: o.platformOrderNo,
            expressNo: o.expressNo,
            expressCompany: o.expressCompany,
            expressCompanyName: kuaidi100_client_1.EXPRESS_COMPANIES.find((c) => c.code === o.expressCompany)?.name ?? o.expressCompany,
            expressPhoneTail: o.expressPhoneTail,
            logisticsState: o.logisticsState,
            logisticsStateLabel: o.logisticsState === null ? null : (kuaidi100_client_1.LOGISTICS_STATE_LABEL[o.logisticsState] ?? `状态${o.logisticsState}`),
            trace: Array.isArray(o.logisticsTrace) ? o.logisticsTrace : [],
            checkedAt: o.logisticsCheckedAt,
            error: o.logisticsError,
        };
    }
};
exports.PurchaseOrderLogisticsCore = PurchaseOrderLogisticsCore;
exports.PurchaseOrderLogisticsCore = PurchaseOrderLogisticsCore = PurchaseOrderLogisticsCore_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        kuaidi100_client_1.Kuaidi100Client])
], PurchaseOrderLogisticsCore);
//# sourceMappingURL=purchase-order-logistics.core.js.map