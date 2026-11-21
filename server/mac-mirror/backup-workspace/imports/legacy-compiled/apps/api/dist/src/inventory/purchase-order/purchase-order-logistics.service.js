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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderLogisticsService = exports.PURCHASE_PLATFORMS = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const kuaidi100_client_1 = require("./kuaidi100.client");
const purchase_order_logistics_core_1 = require("./purchase-order-logistics.core");
exports.PURCHASE_PLATFORMS = ['1688', 'TAOBAO', 'PDD', 'OTHER'];
let PurchaseOrderLogisticsService = class PurchaseOrderLogisticsService {
    prisma;
    audit;
    ctx;
    client;
    core;
    constructor(prisma, audit, ctx, client, core) {
        this.prisma = prisma;
        this.audit = audit;
        this.ctx = ctx;
        this.client = client;
        this.core = core;
    }
    meta() {
        return { configured: this.client.isConfigured(), companies: kuaidi100_client_1.EXPRESS_COMPANIES, platforms: exports.PURCHASE_PLATFORMS, stateLabels: kuaidi100_client_1.LOGISTICS_STATE_LABEL };
    }
    async order(id) {
        const o = await this.prisma.purchaseOrder.findFirst({ where: { id, tenantId: this.ctx.tenantId } });
        if (!o)
            throw new common_1.NotFoundException('采购单不存在');
        return o;
    }
    async updateInfo(id, dto) {
        const o = await this.order(id);
        if (o.status === 'CANCELLED' || o.status === 'DRAFT')
            throw new common_1.BadRequestException('这张采购单当前状态不需要登记物流');
        const norm = (v, max = 64) => (v === undefined ? undefined : (v?.trim().slice(0, max) || null));
        if (dto.platform && !exports.PURCHASE_PLATFORMS.includes(dto.platform))
            throw new common_1.BadRequestException('采购平台不在可选范围内');
        const phone = norm(dto.expressPhoneTail, 8);
        if (phone && !/^\d{4,11}$/.test(phone))
            throw new common_1.BadRequestException('手机尾号请填 4 位数字（顺丰需要收件或寄件手机后四位）');
        const expressNo = norm(dto.expressNo, 100);
        const company = norm(dto.expressCompany, 40);
        const data = {};
        if (dto.platform !== undefined)
            data.platform = dto.platform || null;
        if (dto.platformOrderNo !== undefined)
            data.platformOrderNo = norm(dto.platformOrderNo);
        if (expressNo !== undefined)
            data.expressNo = expressNo;
        if (company !== undefined)
            data.expressCompany = company;
        if (phone !== undefined)
            data.expressPhoneTail = phone;
        const changedTrack = (expressNo !== undefined && expressNo !== o.expressNo) || (company !== undefined && company !== o.expressCompany);
        if (changedTrack) {
            data.logisticsState = null;
            data.logisticsTrace = client_1.Prisma.DbNull;
            data.logisticsCheckedAt = null;
            data.logisticsError = null;
        }
        await this.prisma.purchaseOrder.update({ where: { id }, data });
        await this.audit.record({
            action: 'UPDATE',
            entityType: 'PurchaseOrder',
            entityId: id,
            beforeData: { platform: o.platform, platformOrderNo: o.platformOrderNo, expressNo: o.expressNo, expressCompany: o.expressCompany },
            afterData: { platform: dto.platform, platformOrderNo: dto.platformOrderNo, expressNo, expressCompany: company },
            remark: '登记采购平台/物流单号',
            tenantId: this.ctx.tenantId,
            storeId: o.storeId,
            accountId: this.ctx.accountId,
            requestId: this.ctx.requestId,
        });
        const fresh = await this.order(id);
        if (fresh.expressNo && fresh.expressCompany && this.client.isConfigured() && changedTrack)
            return this.core.refreshOrder(fresh.id, false);
        return this.core.view(fresh);
    }
    async refresh(id) {
        const o = await this.order(id);
        return this.core.refreshOrder(o.id, true);
    }
    async get(id) {
        return this.core.view(await this.order(id));
    }
    async shipments(id) {
        await this.order(id);
        const rows = await this.prisma.purchaseOrderShipment.findMany({ where: { purchaseOrderId: id }, orderBy: [{ createdAt: 'asc' }, { platformOrderNo: 'asc' }] });
        return rows.map((r) => this.core.shipmentView(r));
    }
    async refreshShipments(id) {
        await this.order(id);
        const rows = await this.prisma.purchaseOrderShipment.findMany({
            where: { purchaseOrderId: id, expressNo: { not: '' }, expressCompany: { not: null }, OR: [{ logisticsState: null }, { logisticsState: { notIn: kuaidi100_client_1.LOGISTICS_FINAL_STATES } }] },
            select: { id: true },
        });
        void this.core.refreshShipments(rows.map((r) => r.id));
        return { queued: rows.length };
    }
    async refreshShipment(id, shipmentId) {
        await this.order(id);
        const sh = await this.prisma.purchaseOrderShipment.findFirst({ where: { id: shipmentId, purchaseOrderId: id } });
        if (!sh)
            throw new common_1.NotFoundException('平台订单不存在');
        return this.core.refreshShipment(shipmentId, true);
    }
};
exports.PurchaseOrderLogisticsService = PurchaseOrderLogisticsService;
exports.PurchaseOrderLogisticsService = PurchaseOrderLogisticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService,
        kuaidi100_client_1.Kuaidi100Client,
        purchase_order_logistics_core_1.PurchaseOrderLogisticsCore])
], PurchaseOrderLogisticsService);
//# sourceMappingURL=purchase-order-logistics.service.js.map