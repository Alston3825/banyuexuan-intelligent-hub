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
exports.InventoryItemService = void 0;
const inventory_item_import_service_1 = require("./inventory-item-import.service");
const common_1 = require("@nestjs/common");
const item_match_1 = require("../common/item-match");
const item_similarity_1 = require("../common/item-similarity");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const base_scoped_crud_service_1 = require("../../common/base/base-scoped-crud.service");
let InventoryItemService = class InventoryItemService extends base_scoped_crud_service_1.BaseScopedCrudService {
    prisma;
    entityType = 'InventoryItem';
    constructor(prisma, auditLogService, ctx) {
        super(auditLogService, ctx);
        this.prisma = prisma;
    }
    get delegate() {
        return this.prisma.inventoryItem;
    }
    findMany() {
        return this.prisma.inventoryItem.findMany({ where: { tenantId: this.ctx.tenantId }, orderBy: { createdAt: 'desc' } });
    }
    async search(keyword) {
        const all = await this.prisma.inventoryItem.findMany({
            where: { tenantId: this.ctx.tenantId, status: 'ACTIVE' },
            select: { id: true, code: true, name: true, spec: true, brand: true, category: true, unit: true, referencePrice: true },
            orderBy: [{ name: 'asc' }],
            take: 5000,
        });
        return all.filter((i) => (0, item_match_1.itemMatchesKeyword)(i, keyword)).slice(0, 30);
    }
    async similar(name, spec) {
        const n = (name ?? '').trim();
        if (!n)
            return [];
        const all = await this.prisma.inventoryItem.findMany({
            where: { tenantId: this.ctx.tenantId },
            select: { id: true, code: true, name: true, spec: true, brand: true, unit: true, status: true },
            take: 5000,
        });
        return all
            .map((i) => ({ ...i, score: (0, item_similarity_1.nameSimilarity)(n, i.name) }))
            .filter((i) => i.score >= 0.6)
            .map((i) => ({ ...i, exact: (0, item_similarity_1.normName)(i.name) === (0, item_similarity_1.normName)(n) && (0, item_similarity_1.normName)(i.spec) === (0, item_similarity_1.normName)(spec) }))
            .sort((a, b) => Number(b.exact) - Number(a.exact) || b.score - a.score)
            .slice(0, 5);
    }
    async nextCode() {
        const rows = await this.prisma.inventoryItem.findMany({ where: { tenantId: this.ctx.tenantId }, select: { code: true } });
        return (0, inventory_item_import_service_1.nextFreeCodes)(rows, 1)[0];
    }
    async create(data) {
        const base = { ...data, spec: data.spec?.trim() || undefined, brand: data.brand?.trim() || undefined, tenantId: this.ctx.tenantId };
        if (data.code?.trim())
            return super.create({ ...base, code: data.code.trim() });
        try {
            return await super.create({ ...base, code: await this.nextCode() });
        }
        catch (e) {
            if (e.code !== 'P2002')
                throw e;
            return super.create({ ...base, code: await this.nextCode() });
        }
    }
    update(id, data, expectedVersion) {
        const cleaned = { ...data };
        for (const k of ['spec', 'brand', 'category']) {
            if (typeof cleaned[k] === 'string')
                cleaned[k] = cleaned[k].trim() || null;
        }
        if (typeof cleaned.unit === 'string') {
            cleaned.unit = cleaned.unit.trim();
            if (!cleaned.unit)
                throw new common_1.BadRequestException('计量单位不能为空');
        }
        return super.update(id, cleaned, expectedVersion);
    }
    async deleteCheck(id) {
        const item = await this.prisma.inventoryItem.findFirst({
            where: { id, tenantId: this.ctx.tenantId },
            include: { _count: { select: { batches: true, purchaseOrderItems: true, purchaseRequestItems: true, goodsReceiptItems: true, stockIssueItems: true, stockTransferItems: true, stockCountItems: true } } },
        });
        if (!item)
            throw new common_1.NotFoundException('物品不存在');
        const stock = await this.prisma.warehouseStock.aggregate({ where: { itemId: id }, _sum: { quantity: true } });
        const stockQty = stock._sum.quantity ?? 0;
        const recordCount = Object.values(item._count).reduce((a, b) => a + b, 0);
        const canForce = await this.ctx.hasPermission('inventory.item.force-delete');
        let outcome;
        let reason;
        if (stockQty > 0) {
            outcome = canForce ? 'HIDE' : 'BLOCKED';
            reason = canForce
                ? `这个物品还有库存 ${stockQty}${item.unit}，且有历史记录，删除只会隐藏（库存数据保留，随时可恢复）。`
                : `这个物品还有库存 ${stockQty}${item.unit}，不能删除。请先出库或盘点清零；如果只是暂时不用，可以在“编辑”里改成“停用”。`;
        }
        else if (recordCount > 0) {
            outcome = 'HIDE';
            reason = `这个物品已有 ${recordCount} 条单据/批次记录，删除只会隐藏（历史单据照常显示，随时可在“编辑”里恢复）。`;
        }
        else {
            outcome = 'DELETE';
            reason = '这个物品没有库存也没有任何记录，将永久删除。';
        }
        return { item, stockQty, recordCount, outcome, reason };
    }
    async remove(id) {
        const check = await this.deleteCheck(id);
        if (check.outcome === 'BLOCKED')
            throw new common_1.BadRequestException(check.reason);
        if (check.outcome === 'HIDE') {
            if (check.item.status !== 'INACTIVE') {
                const after = await this.prisma.inventoryItem.update({ where: { id }, data: { status: 'INACTIVE', version: { increment: 1 } } });
                await this.auditLogService.record({ action: 'UPDATE', entityType: this.entityType, entityId: id, beforeData: check.item, afterData: after, remark: '删除物品（有记录，仅隐藏）', ...this.auditContext() });
            }
            return { outcome: 'HIDDEN', message: `已隐藏“${check.item.name}”（有历史记录，未真正删除；需要时可在“编辑”里恢复为启用）` };
        }
        await this.prisma.$transaction([
            this.prisma.warehouseStock.deleteMany({ where: { itemId: id } }),
            this.prisma.inventoryItem.delete({ where: { id } }),
        ]);
        await this.auditLogService.record({ action: 'DELETE', entityType: this.entityType, entityId: id, beforeData: check.item, remark: '删除物品（无库存无记录）', ...this.auditContext() });
        return { outcome: 'DELETED', message: `已删除“${check.item.name}”` };
    }
    async priceHistory(id) {
        if (!(await this.ctx.hasPermission('inventory.item.view')) && !(await this.ctx.hasPermission('inventory.warehouse-stock.view')) && !(await this.ctx.hasPermission('inventory.purchase-order.view'))) {
            throw new common_1.ForbiddenException('没有查看采购价格的权限');
        }
        const item = await this.prisma.inventoryItem.findFirst({ where: { id, tenantId: this.ctx.tenantId }, select: { id: true, name: true, spec: true, unit: true } });
        if (!item)
            throw new common_1.NotFoundException('物品不存在');
        const receiptSelect = { id: true, receiptNo: true, tracked: true, completedAt: true, createdAt: true, warehouse: { select: { name: true } }, purchaseOrder: { select: { orderNo: true, supplier: { select: { name: true } } } } };
        const confirmLines = await this.prisma.goodsReceiptConfirmationLine.findMany({
            where: { receiptItem: { itemId: id, goodsReceipt: { tenantId: this.ctx.tenantId } } },
            include: { confirmation: { select: { confirmedAt: true } }, receiptItem: { select: { unitCost: true, goodsReceipt: { select: receiptSelect } } } },
        });
        const legacy = await this.prisma.goodsReceiptItem.findMany({
            where: { itemId: id, goodsReceipt: { tenantId: this.ctx.tenantId, tracked: false, status: 'COMPLETED' } },
            include: { goodsReceipt: { select: receiptSelect } },
        });
        const rows = [
            ...confirmLines.map((l) => ({ date: l.confirmation.confirmedAt, quantity: l.quantity, unitCost: l.receiptItem.unitCost, receipt: l.receiptItem.goodsReceipt })),
            ...legacy.map((l) => ({ date: l.goodsReceipt.completedAt ?? l.goodsReceipt.createdAt, quantity: l.quantity, unitCost: l.unitCost, receipt: l.goodsReceipt })),
        ]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((r) => ({
            date: r.date,
            receiptId: r.receipt.id,
            receiptNo: r.receipt.receiptNo,
            orderNo: r.receipt.purchaseOrder?.orderNo ?? null,
            supplierName: r.receipt.purchaseOrder?.supplier.name ?? null,
            warehouseName: r.receipt.warehouse.name,
            quantity: r.quantity,
            unitCost: r.unitCost,
        }));
        const totalQty = rows.reduce((a, r) => a + r.quantity, 0);
        const avgCost = totalQty > 0 ? Math.round(rows.reduce((a, r) => a + r.quantity * r.unitCost, 0) / totalQty) : 0;
        return { item, rows, avgCost, minCost: rows.length ? Math.min(...rows.map((r) => r.unitCost)) : 0, maxCost: rows.length ? Math.max(...rows.map((r) => r.unitCost)) : 0 };
    }
};
exports.InventoryItemService = InventoryItemService;
exports.InventoryItemService = InventoryItemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], InventoryItemService);
//# sourceMappingURL=inventory-item.service.js.map