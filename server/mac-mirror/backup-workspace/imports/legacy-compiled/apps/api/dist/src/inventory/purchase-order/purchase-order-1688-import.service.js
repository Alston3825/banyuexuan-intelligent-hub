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
exports.PurchaseOrder1688ImportService = exports.companyCodeOf = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const xlsx_reader_1 = require("../../common/utils/xlsx-reader");
const purchase_order_logistics_core_1 = require("./purchase-order-logistics.core");
const COMPANY_KEYWORDS = [
    ['中通快运', 'zhongtongkuaiyun'],
    ['中通', 'zhongtong'],
    ['圆通', 'yuantong'],
    ['申通', 'shentong'],
    ['韵达', 'yunda'],
    ['极兔', 'jtexpress'],
    ['顺丰', 'shunfeng'],
    ['邮政', 'youzhengguonei'],
    ['EMS', 'ems'],
    ['京东', 'jd'],
    ['德邦', 'debangwuliu'],
    ['百世', 'huitongkuaidi'],
    ['优速', 'youshuwuliu'],
    ['安能', 'annengwuliu'],
    ['跨越', 'kuayue'],
    ['宅急送', 'zhaijisong'],
];
const companyCodeOf = (raw) => COMPANY_KEYWORDS.find(([k]) => raw.toUpperCase().includes(k))?.[1] ?? null;
exports.companyCodeOf = companyCodeOf;
const HEADERS = {
    orderNo: '订单编号',
    seller: '卖家公司名',
    sellerMember: '卖家会员名',
    goodsTotal: '货品总价(元)',
    freight: '运费(元)',
    paid: '实付款(元)',
    status: '订单状态',
    createdAt: '订单创建时间',
    title: '货品标题',
    company: '物流公司',
    expressNo: '运单号',
};
const text = (v) => (v === null || v === undefined ? '' : String(v).trim());
const num = (v) => {
    const n = Number(text(v).replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
};
const fen = (yuan) => Math.round(yuan * 100);
const excelDate = (v) => {
    const s = text(v);
    if (!s)
        return null;
    if (/^\d+(\.\d+)?$/.test(s))
        return new Date((Number(s) - 25569) * 86400_000 - 8 * 3600_000).toISOString();
    const d = new Date(s.replace(/-/g, '/') + ' +0800');
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
};
const grams = (s) => {
    const t = s.replace(/[\s（）()【】\[\]、,，.。/\\*×xX\d-]+/g, '');
    const out = new Set();
    for (let i = 0; i < t.length - 1; i++)
        out.add(t.slice(i, i + 2));
    return out;
};
const containment = (a, b) => {
    const ga = grams(a);
    if (!ga.size)
        return 0;
    const gb = grams(b);
    let hit = 0;
    for (const g of ga)
        if (gb.has(g))
            hit++;
    return hit / ga.size;
};
const dice = (a, b) => {
    const ga = grams(a);
    const gb = grams(b);
    if (!ga.size || !gb.size)
        return 0;
    let hit = 0;
    for (const g of ga)
        if (gb.has(g))
            hit++;
    return (2 * hit) / (ga.size + gb.size);
};
let PurchaseOrder1688ImportService = class PurchaseOrder1688ImportService {
    prisma;
    ctx;
    core;
    constructor(prisma, ctx, core) {
        this.prisma = prisma;
        this.ctx = ctx;
        this.core = core;
    }
    parse(buf) {
        let sheets;
        try {
            sheets = (0, xlsx_reader_1.readXlsx)(buf);
        }
        catch (e) {
            throw new common_1.BadRequestException(e instanceof Error ? e.message : '文件读取失败');
        }
        const sheet = sheets[0];
        if (!sheet || sheet.rows.length < 2)
            throw new common_1.BadRequestException('表格里没有数据');
        const head = sheet.rows[0].map((c) => text(c));
        const col = (name) => head.indexOf(name);
        const idx = Object.fromEntries(Object.entries(HEADERS).map(([k, h]) => [k, col(h)]));
        if (idx.orderNo < 0 || idx.title < 0)
            throw new common_1.BadRequestException('这不像 1688 导出的订单表（找不到“订单编号”“货品标题”列）');
        const get = (r, k) => (idx[k] >= 0 ? r[idx[k]] : null);
        const orders = [];
        let cur = null;
        for (const r of sheet.rows.slice(1)) {
            if (!r || r.every((c) => c === null || text(c) === ''))
                continue;
            const no = text(get(r, 'orderNo'));
            if (no) {
                cur = {
                    orderNo: no,
                    seller: text(get(r, 'seller')),
                    sellerMember: text(get(r, 'sellerMember')),
                    status: text(get(r, 'status')),
                    createdAt: excelDate(get(r, 'createdAt')),
                    goodsTotal: num(get(r, 'goodsTotal')),
                    freight: num(get(r, 'freight')),
                    paid: num(get(r, 'paid')),
                    titles: [],
                    expressCompanyRaw: '',
                    expressCompany: null,
                    expressNos: [],
                };
                orders.push(cur);
            }
            if (!cur)
                continue;
            const title = text(get(r, 'title'));
            if (title)
                cur.titles.push(title);
            const comp = text(get(r, 'company'));
            if (comp && !cur.expressCompanyRaw)
                cur.expressCompanyRaw = comp;
            for (const n of text(get(r, 'expressNo')).split(/[,，;；\s]+/))
                if (n && !cur.expressNos.includes(n))
                    cur.expressNos.push(n);
        }
        for (const o of orders)
            o.expressCompany = (0, exports.companyCodeOf)(o.expressCompanyRaw);
        return orders;
    }
    async preview(buf) {
        const orders = this.parse(buf);
        if (!orders.length)
            throw new common_1.BadRequestException('表格里没有订单');
        const since = new Date(Date.now() - 90 * 86400_000);
        const pos = await this.prisma.purchaseOrder.findMany({
            where: { tenantId: this.ctx.tenantId, status: { notIn: ['DRAFT', 'CANCELLED', 'REJECTED'] }, createdAt: { gte: since } },
            include: { supplier: { select: { name: true } }, items: { include: { item: { select: { name: true, spec: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
        const brief = (p) => ({
            id: p.id,
            orderNo: p.orderNo,
            supplierName: p.supplier.name,
            status: p.status,
            totalAmount: p.totalAmount,
            createdAt: p.createdAt.toISOString(),
            itemsText: p.items.map((i) => `${i.item.name}${i.item.spec ? `(${i.item.spec})` : ''}×${i.quantity}`).join('、'),
            expressNo: p.expressNo,
            platformOrderNo: p.platformOrderNo,
        });
        const linked = await this.prisma.purchaseOrderShipment.findMany({
            where: { tenantId: this.ctx.tenantId, platformOrderNo: { in: orders.map((o) => o.orderNo) } },
            select: { platformOrderNo: true, purchaseOrderId: true },
        });
        const linkedMap = new Map(linked.map((l) => [l.platformOrderNo, l.purchaseOrderId]));
        const rows = orders.map((o) => {
            const sellerNames = [o.seller, o.sellerMember].filter(Boolean);
            const allTitles = o.titles.join(' ');
            const amounts = [o.goodsTotal, o.paid, o.goodsTotal + o.freight].map(fen);
            const scored = pos.map((p) => {
                let score = 0;
                const reasons = [];
                if (linkedMap.get(o.orderNo) === p.id || p.platformOrderNo === o.orderNo)
                    return { p, score: 200, reasons: ['已经登记过这张 1688 订单号'] };
                if (p.totalAmount > 0 && amounts.includes(p.totalAmount)) {
                    score += 50;
                    reasons.push(`金额一致（${(p.totalAmount / 100).toFixed(2)} 元）`);
                }
                const sup = p.supplier.name;
                const supSim = Math.max(0, ...sellerNames.map((x) => (x.includes(sup) || sup.includes(x) ? 1 : dice(x, sup))));
                if (supSim >= 0.5) {
                    score += Math.round(25 * supSim);
                    reasons.push('供应商名称相近');
                }
                const hits = p.items.filter((i) => containment(`${i.item.name}`, allTitles) >= 0.99).map((i) => i.item.name);
                if (hits.length) {
                    score += Math.min(60, 45 + hits.length * 5);
                    reasons.push(`货品相符：${hits.slice(0, 3).join('、')}`);
                }
                else {
                    const best = Math.max(0, ...p.items.map((i) => containment(`${i.item.name}`, allTitles)));
                    if (best >= 0.5) {
                        score += Math.round(30 * best);
                        reasons.push('货品名称部分相符');
                    }
                }
                return { p, score, reasons };
            });
            const ranked = scored.filter((x) => x.score >= 30).sort((a, b) => b.score - a.score);
            const pick = ranked[0] ?? null;
            const margin = pick ? pick.score - (ranked[1]?.score ?? 0) : 0;
            const confidence = !pick ? 'none' : pick.score >= 200 || (pick.score >= 50 && margin >= 15) ? 'high' : pick.score >= 40 ? 'medium' : 'none';
            const notes = [];
            if (/关闭|取消/.test(o.status))
                notes.push(`订单状态“${o.status}”，一般不用登记`);
            if (!o.expressNos.length)
                notes.push('还没发货/没有运单号，只登记订单号，发货后再导入一次即可补上运单号');
            else if (!o.expressCompany)
                notes.push(`快递公司“${o.expressCompanyRaw || '空'}”没认出来，只登记订单号，不查物流`);
            if (o.expressNos.length > 1)
                notes.push(`有 ${o.expressNos.length} 个运单号，每个单号分别查物流`);
            return {
                order: o,
                confidence,
                score: pick?.score ?? 0,
                reasons: pick?.reasons ?? [],
                match: pick && confidence !== 'none' ? brief(pick.p) : null,
                alternatives: ranked.slice(0, 4).map((x) => brief(x.p)),
                alreadyLinked: !!pick && pick.score >= 200,
                notes,
            };
        });
        rows.sort((a, b) => ({ high: 0, medium: 1, none: 2 })[a.confidence] - ({ high: 0, medium: 1, none: 2 })[b.confidence]);
        return { rows, total: rows.length };
    }
    async commit(items) {
        if (!items?.length)
            throw new common_1.BadRequestException('没有要登记的订单');
        const tenantId = this.ctx.tenantId;
        const results = [];
        const toRefresh = [];
        for (const it of items) {
            const base = { purchaseOrderId: it.purchaseOrderId, platformOrderNo: it.platformOrderNo };
            try {
                const po = await this.prisma.purchaseOrder.findFirst({ where: { id: it.purchaseOrderId, tenantId }, select: { id: true, status: true, orderNo: true } });
                if (!po)
                    throw new common_1.BadRequestException('采购单不存在');
                if (po.status === 'DRAFT' || po.status === 'CANCELLED')
                    throw new common_1.BadRequestException('这张采购单当前状态不需要登记物流');
                const other = await this.prisma.purchaseOrderShipment.findFirst({ where: { tenantId, platformOrderNo: it.platformOrderNo, purchaseOrderId: { not: po.id } }, include: { purchaseOrder: { select: { orderNo: true } } } });
                if (other)
                    throw new common_1.BadRequestException(`这张 1688 订单已经登记在采购单 ${other.purchaseOrder.orderNo} 上`);
                const nos = (it.expressNos ?? []).map((n) => n.trim()).filter(Boolean);
                const company = it.expressCompany || null;
                const common = {
                    sellerName: it.sellerName?.slice(0, 120) || null,
                    goodsTitle: it.goodsTitle?.slice(0, 500) || null,
                    amount: fen(it.paid ?? 0),
                    orderStatus: it.orderStatus?.slice(0, 40) || null,
                };
                for (const no of nos.length ? nos : ['']) {
                    const key = { purchaseOrderId: po.id, platformOrderNo: it.platformOrderNo, expressNo: no };
                    const sh = await this.prisma.purchaseOrderShipment.upsert({
                        where: { purchaseOrderId_platformOrderNo_expressNo: key },
                        create: { tenantId, platform: '1688', ...key, ...common, expressCompany: no ? company : null, createdBy: this.ctx.accountId },
                        update: { ...common, expressCompany: no ? company : null },
                    });
                    if (no && company && (sh.logisticsState === null || sh.logisticsState === -1 || sh.logisticsError))
                        toRefresh.push(sh.id);
                }
                if (nos.length)
                    await this.prisma.purchaseOrderShipment.deleteMany({ where: { purchaseOrderId: po.id, platformOrderNo: it.platformOrderNo, expressNo: '' } });
                results.push({ ...base, ok: true });
            }
            catch (e) {
                results.push({ ...base, ok: false, error: e instanceof Error ? e.message : '登记失败' });
            }
        }
        if (toRefresh.length)
            void this.core.refreshShipments(toRefresh);
        return { results, okCount: results.filter((r) => r.ok).length, querying: toRefresh.length };
    }
};
exports.PurchaseOrder1688ImportService = PurchaseOrder1688ImportService;
exports.PurchaseOrder1688ImportService = PurchaseOrder1688ImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        request_context_service_1.RequestContextService,
        purchase_order_logistics_core_1.PurchaseOrderLogisticsCore])
], PurchaseOrder1688ImportService);
//# sourceMappingURL=purchase-order-1688-import.service.js.map