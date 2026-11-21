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
exports.PurchaseRequestImportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const data_scope_service_1 = require("../../common/scope/data-scope.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const xlsx_reader_1 = require("../../common/utils/xlsx-reader");
const inventory_item_import_service_1 = require("../inventory-item/inventory-item-import.service");
const round2 = (n) => Math.round(n * 100) / 100;
const beijingToday = () => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10);
const COLS = {
    department: (h) => h.includes('部门'),
    requester: (h) => h.includes('申请人') || h.includes('申购人'),
    name: (h) => ['物品名称', '名称', '品名', '物品', '商品名称', '物料名称'].includes(h),
    spec: (h) => h.includes('规格') || h.includes('型号') || h.includes('尺寸'),
    brand: (h) => h.includes('品牌'),
    quantity: (h) => h === '数量' || h === '申购数量',
    unit: (h) => h === '单位' || h === '计量单位',
    price: (h) => h.includes('单价'),
    subtotal: (h) => h.includes('小计') || h === '金额',
    purpose: (h) => h.includes('用途'),
};
const text = (v) => {
    if (v === null || v === undefined)
        return null;
    const t = (0, inventory_item_import_service_1.norm)(String(v));
    return t || null;
};
const num = (v) => {
    if (typeof v === 'number')
        return Number.isFinite(v) ? v : null;
    if (typeof v === 'string' && v.trim()) {
        const n = Number(v.replace(/[,\s元]/g, ''));
        return Number.isFinite(n) ? n : null;
    }
    return null;
};
let PurchaseRequestImportService = class PurchaseRequestImportService {
    prisma;
    itemImport;
    auditLogService;
    dataScope;
    ctx;
    constructor(prisma, itemImport, auditLogService, dataScope, ctx) {
        this.prisma = prisma;
        this.itemImport = itemImport;
        this.auditLogService = auditLogService;
        this.dataScope = dataScope;
        this.ctx = ctx;
    }
    async itemKeyMap() {
        const items = await this.prisma.inventoryItem.findMany({ where: { tenantId: this.ctx.tenantId }, select: { id: true, name: true, spec: true } });
        return new Map(items.map((i) => [(0, inventory_item_import_service_1.keyOf)(i.name, i.spec), i.id]));
    }
    rowIssues(r) {
        const issues = [];
        if (r.quantity === null)
            issues.push('缺数量');
        else if (!Number.isInteger(r.quantity) || r.quantity < 1)
            issues.push('数量应为大于 0 的整数');
        if (r.unitPrice !== null && r.unitPrice < 0)
            issues.push('单价不能是负数');
        return issues;
    }
    async findDuplicate(storeId, requestDate) {
        if (!storeId || !requestDate)
            return null;
        const dup = await this.prisma.purchaseRequest.findFirst({
            where: { tenantId: this.ctx.tenantId, storeId, requestDate: new Date(`${requestDate}T00:00:00.000Z`), status: { not: 'CANCELLED' } },
            select: { id: true, requestNo: true, totalAmount: true },
        });
        return dup ? { id: dup.id, requestNo: dup.requestNo, totalAmount: dup.totalAmount.toString() } : null;
    }
    async preview(file) {
        let sheets;
        try {
            sheets = (0, xlsx_reader_1.readXlsx)(file);
        }
        catch (e) {
            throw new common_1.BadRequestException(`读取不了这个文件：${e.message}。请上传 Excel（.xlsx）文件`);
        }
        for (const sheet of sheets) {
            const headerIdx = sheet.rows.slice(0, 20).findIndex((r) => r.some((c) => COLS.name(text(c) ?? '')));
            if (headerIdx < 0)
                continue;
            const header = sheet.rows[headerIdx].map((c) => text(c) ?? '');
            const idxOf = (k) => header.findIndex((h) => h && COLS[k](h));
            const idx = Object.fromEntries(Object.keys(COLS).map((k) => [k, idxOf(k)]));
            const titleText = sheet.rows.slice(0, headerIdx).flat().map(text).filter(Boolean).join(' ') || null;
            const stores = await this.prisma.store.findMany({ where: { tenantId: this.ctx.tenantId }, select: { id: true, name: true } });
            const token = titleText ? /申购部门[：:]\s*([^\s\d]+)/.exec(titleText)?.[1] : undefined;
            const storeGuess = token ? (stores.find((s) => s.name.includes(token)) ?? null) : null;
            const dm = titleText ? /(\d{4})\s*[.\-/年]\s*(\d{1,2})\s*[.\-/月]\s*(\d{1,2})/.exec(titleText) : null;
            const requestDate = dm ? `${dm[1]}-${dm[2].padStart(2, '0')}-${dm[3].padStart(2, '0')}` : null;
            const itemByKey = await this.itemKeyMap();
            const rows = [];
            let sheetTotal = null;
            for (let r = headerIdx + 1; r < sheet.rows.length; r++) {
                const row = sheet.rows[r] ?? [];
                const get = (k) => (idx[k] >= 0 ? row[idx[k]] : null);
                const name = text(get('name'));
                if (!name) {
                    if (row.some((c) => text(c) === '合计') && idx.subtotal >= 0)
                        sheetTotal = num(row[idx.subtotal]);
                    continue;
                }
                const base = {
                    rowNo: r + 1,
                    department: text(get('department')),
                    requester: text(get('requester')),
                    name,
                    spec: text(get('spec')),
                    brand: text(get('brand')),
                    unit: text(get('unit')),
                    quantity: num(get('quantity')),
                    unitPrice: ((p) => (p !== null && p > 0 ? p : null))(num(get('price'))),
                    purpose: text(get('purpose')),
                };
                rows.push({ ...base, sheetSubtotal: num(get('subtotal')), itemId: itemByKey.get((0, inventory_item_import_service_1.keyOf)(name, base.spec)) ?? null, issues: this.rowIssues(base) });
            }
            return { sheetName: sheet.name, headerRow: headerIdx + 1, titleText, storeGuess, requestDate, sheetTotal, rows, duplicate: await this.findDuplicate(storeGuess?.id ?? null, requestDate) };
        }
        throw new common_1.BadRequestException('没有在表里找到“物品名称”这一列，请确认表头里有“物品名称”');
    }
    async checkDuplicate(storeId, requestDate) {
        return this.findDuplicate(storeId, requestDate);
    }
    async commit(input) {
        const store = await this.prisma.store.findFirst({ where: { id: input.storeId, tenantId: this.ctx.tenantId } });
        if (!store)
            throw new common_1.BadRequestException('请选择申购所属的门店');
        await this.dataScope.assertStoreAccessible(this.ctx, store.id);
        const requestDate = input.requestDate && /^\d{4}-\d{2}-\d{2}$/.test(input.requestDate) ? input.requestDate : beijingToday();
        if (!Array.isArray(input.rows) || input.rows.length === 0)
            throw new common_1.BadRequestException('没有要导入的物品');
        if (input.rows.length > 1000)
            throw new common_1.BadRequestException('一张申购单最多 1000 行');
        const rows = input.rows.map((r) => ({
            ...r,
            name: (0, inventory_item_import_service_1.norm)(r.name),
            spec: (0, inventory_item_import_service_1.norm)(r.spec) || null,
            brand: (0, inventory_item_import_service_1.norm)(r.brand) || null,
            unit: (0, inventory_item_import_service_1.norm)(r.unit) || null,
            department: (0, inventory_item_import_service_1.norm)(r.department) || null,
            requester: (0, inventory_item_import_service_1.norm)(r.requester) || null,
            purpose: (0, inventory_item_import_service_1.norm)(r.purpose) || null,
            unitPrice: r.unitPrice === null || r.unitPrice === undefined || r.unitPrice === 0 ? null : Number(r.unitPrice),
            quantity: r.quantity === null || r.quantity === undefined ? null : Number(r.quantity),
        }));
        const bad = rows.filter((r) => !r.name || this.rowIssues(r).length > 0);
        if (bad.length > 0) {
            throw new common_1.BadRequestException(`有 ${bad.length} 行不能导入：${bad.slice(0, 5).map((r) => `第 ${r.rowNo} 行${r.name ? ' ' + r.name : ''}（${r.name ? this.rowIssues(r).join('、') : '缺物品名称'}）`).join('；')}${bad.length > 5 ? '…' : ''}。请修改或取消勾选这些行`);
        }
        const dup = await this.findDuplicate(store.id, requestDate);
        if (dup && !input.allowDuplicate) {
            throw new common_1.ConflictException(`这个门店 ${requestDate} 已经有一张申购单 ${dup.requestNo}（金额 ${dup.totalAmount} 元），确认要再导入一张吗？`);
        }
        const unique = [...new Map(rows.map((r) => [(0, inventory_item_import_service_1.keyOf)(r.name, r.spec), r])).values()];
        const itemIds = await this.itemImport.ensureItems(unique.map((r) => ({ rowNo: r.rowNo, name: r.name, spec: r.spec, brand: r.brand, unit: r.unit, referencePrice: r.unitPrice })), { createMissing: input.createMissingItems, purpose: 'LOGISTICS' });
        const lines = rows.map((r, i) => ({
            sortNo: i + 1,
            itemId: itemIds.get((0, inventory_item_import_service_1.keyOf)(r.name, r.spec)) ?? null,
            name: r.name,
            spec: r.spec,
            brand: r.brand,
            unit: r.unit,
            quantity: r.quantity,
            unitPrice: r.unitPrice,
            subtotal: r.unitPrice === null ? 0 : round2(r.quantity * r.unitPrice),
            department: r.department,
            requester: r.requester,
            purpose: r.purpose,
        }));
        const totalAmount = round2(lines.reduce((s, l) => s + l.subtotal, 0));
        const created = await this.prisma.$transaction(async (tx) => {
            const request = await tx.purchaseRequest.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId: store.id,
                    requestNo: (0, business_no_util_1.generateBusinessNo)('SG'),
                    requestDate: new Date(`${requestDate}T00:00:00.000Z`),
                    totalAmount,
                    sourceFileName: input.sourceFileName?.slice(0, 190) || null,
                    remark: input.remark?.trim() || null,
                    createdBy: this.ctx.accountId,
                },
            });
            await tx.purchaseRequestItem.createMany({ data: lines.map((l) => ({ ...l, purchaseRequestId: request.id })) });
            return request;
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'PurchaseRequest',
            entityId: created.id,
            afterData: { requestNo: created.requestNo, lines: lines.length, totalAmount, source: input.sourceFileName ?? null },
            remark: `Excel 导入申购单 ${created.requestNo}（${lines.length} 行，${totalAmount} 元）`,
            tenantId: this.ctx.tenantId,
            storeId: store.id,
            accountId: this.ctx.accountId,
            requestId: this.ctx.requestId,
        });
        return {
            id: created.id,
            requestNo: created.requestNo,
            lines: lines.length,
            totalAmount,
            linkedItems: lines.filter((l) => l.itemId).length,
            unlinked: lines.filter((l) => !l.itemId).map((l) => l.name),
        };
    }
};
exports.PurchaseRequestImportService = PurchaseRequestImportService;
exports.PurchaseRequestImportService = PurchaseRequestImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_item_import_service_1.InventoryItemImportService,
        audit_log_service_1.AuditLogService,
        data_scope_service_1.DataScopeService,
        request_context_service_1.RequestContextService])
], PurchaseRequestImportService);
//# sourceMappingURL=purchase-request-import.service.js.map