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
exports.GoodsReceiptService = void 0;
const common_1 = require("@nestjs/common");
const inventory_item_import_service_1 = require("../inventory-item/inventory-item-import.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const date_util_1 = require("../../common/utils/date.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const workflow_engine_service_1 = require("../../workflow/workflow-engine/workflow-engine.service");
const DEFINITION_CODE = 'INVENTORY_GOODS_RECEIPT';
const BUSINESS_TYPE = 'GOODS_RECEIPT';
const includeReceipt = {
    warehouse: true,
    purchaseOrder: true,
    items: { include: { item: true } },
    confirmations: { orderBy: { confirmedAt: 'asc' }, include: { lines: true } },
};
let GoodsReceiptService = class GoodsReceiptService {
    prisma;
    workflowEngineService;
    auditLogService;
    ctx;
    itemImport;
    constructor(prisma, workflowEngineService, auditLogService, ctx, itemImport) {
        this.prisma = prisma;
        this.workflowEngineService = workflowEngineService;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
        this.itemImport = itemImport;
    }
    async findMany(query = {}) {
        const receipts = await this.prisma.goodsReceipt.findMany({
            where: { tenantId: this.ctx.tenantId, storeId: query.storeId, warehouseId: query.warehouseId, status: query.status },
            include: includeReceipt,
            orderBy: { createdAt: 'desc' },
        });
        return Promise.all(receipts.map((r) => this.reconcileStatus(r)));
    }
    async findOneOrThrow(id) {
        const receipt = await this.prisma.goodsReceipt.findUnique({ where: { id }, include: includeReceipt });
        if (!receipt)
            throw new common_1.NotFoundException(`GoodsReceipt ${id} 不存在`);
        return this.attachConfirmerNames(await this.reconcileStatus(receipt));
    }
    async attachConfirmerNames(receipt) {
        const confirmations = receipt.confirmations ?? [];
        if (confirmations.length === 0)
            return receipt;
        const ids = [...new Set(confirmations.map((c) => c.confirmedById))];
        const accs = await this.prisma.account.findMany({ where: { id: { in: ids } }, select: { id: true, realName: true } });
        const name = new Map(accs.map((x) => [x.id, x.realName]));
        return { ...receipt, confirmations: confirmations.map((c) => ({ ...c, confirmedByName: name.get(c.confirmedById) ?? '' })) };
    }
    async create(dto) {
        for (const [idx, i] of dto.items.entries()) {
            if (!i.itemId && !i.newItem)
                throw new common_1.BadRequestException(`第 ${idx + 1} 行请选择物品，或填写新物品的名称和单位`);
        }
        for (const i of dto.items.filter((x) => x.itemId && x.renameItemTo?.trim())) {
            const target = await this.prisma.inventoryItem.findFirst({ where: { id: i.itemId, tenantId: this.ctx.tenantId } });
            if (!target)
                throw new common_1.BadRequestException('存在不存在的物品 ID');
            if (target.name !== i.renameItemTo.trim()) {
                await this.prisma.inventoryItem.update({ where: { id: target.id }, data: { name: i.renameItemTo.trim() } });
                await this.auditLogService.record({ action: 'UPDATE', entityType: 'InventoryItem', entityId: target.id, beforeData: { name: target.name }, afterData: { name: i.renameItemTo.trim() }, remark: '入库时核对相似名称，改用新名称', ...this.auditCtx(dto.storeId) });
            }
        }
        const newOnes = dto.items.filter((i) => !i.itemId);
        if (newOnes.length > 0) {
            const made = await this.itemImport.ensureItems(newOnes.map((i, n) => ({ rowNo: n + 1, name: i.newItem.name, spec: i.newItem.spec ?? null, brand: i.newItem.brand ?? null, unit: i.newItem.unit, referencePrice: i.unitCost > 0 ? i.unitCost / 100 : null })), { createMissing: true, purpose: 'LOGISTICS' });
            for (const i of newOnes) {
                const id = made.get((0, inventory_item_import_service_1.keyOf)(i.newItem.name.trim(), i.newItem.spec?.trim() || null));
                if (!id)
                    throw new common_1.BadRequestException(`新物品「${i.newItem.name}」没能加入物品库，请检查名称和单位`);
                i.itemId = id;
            }
        }
        const itemIds = [...new Set(dto.items.map((i) => i.itemId))];
        const items = await this.prisma.inventoryItem.findMany({ where: { id: { in: itemIds } } });
        if (items.length !== itemIds.length)
            throw new common_1.BadRequestException('存在不存在的物品 ID');
        if (dto.purchaseOrderId) {
            const po = await this.prisma.purchaseOrder.findUnique({ where: { id: dto.purchaseOrderId } });
            if (!po)
                throw new common_1.NotFoundException(`PurchaseOrder ${dto.purchaseOrderId} 不存在`);
            if (po.status !== 'APPROVED')
                throw new common_1.BadRequestException('只能对已审批通过的采购单登记入库');
        }
        const created = await this.prisma.$transaction(async (tx) => {
            const receipt = await tx.goodsReceipt.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId: dto.storeId,
                    warehouseId: dto.warehouseId,
                    purchaseOrderId: dto.purchaseOrderId,
                    receiptNo: (0, business_no_util_1.generateBusinessNo)('RK'),
                    remark: dto.remark,
                    createdBy: this.ctx.accountId,
                },
            });
            await tx.goodsReceiptItem.createMany({
                data: dto.items.map((i) => ({ goodsReceiptId: receipt.id, itemId: i.itemId, quantity: i.quantity, unitCost: i.unitCost })),
            });
            return receipt;
        });
        const withItems = await this.findOneOrThrow(created.id);
        await this.auditLogService.record({ action: 'CREATE', entityType: 'GoodsReceipt', entityId: created.id, afterData: withItems, ...this.auditCtx(dto.storeId) });
        return withItems;
    }
    async submit(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'DRAFT')
            throw new common_1.BadRequestException(`入库单当前状态「${before.status}」不允许提交`);
        this.assertNotTracked(before);
        if (before.purchaseOrderId) {
            const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.goodsReceipt.update({
                where: { id, version: expectedVersion },
                data: { status: 'APPROVED', version: { increment: 1 } },
                include: includeReceipt,
            }));
            await this.auditLogService.record({
                action: 'STATE_TRANSITION',
                entityType: 'GoodsReceipt',
                entityId: id,
                beforeData: before,
                afterData: updated,
                remark: 'DRAFT -> APPROVED（挂在已审批采购单下，跳过自身审批）',
                ...this.auditCtx(before.storeId),
            });
            return updated;
        }
        const warehouse = await this.prisma.warehouse.findUniqueOrThrow({ where: { id: before.warehouseId } });
        if (!warehouse.requiresApproval) {
            const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.goodsReceipt.update({
                where: { id, version: expectedVersion },
                data: { status: 'APPROVED', version: { increment: 1 } },
                include: includeReceipt,
            }));
            await this.auditLogService.record({
                action: 'STATE_TRANSITION',
                entityType: 'GoodsReceipt',
                entityId: id,
                beforeData: before,
                afterData: updated,
                remark: 'DRAFT -> APPROVED（仓库免审批）',
                ...this.auditCtx(before.storeId),
            });
            return updated;
        }
        await this.workflowEngineService.startInstance({ definitionCode: DEFINITION_CODE, businessType: BUSINESS_TYPE, businessId: id, title: before.receiptNo, storeId: before.storeId }, this.actor());
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.goodsReceipt.update({
            where: { id, version: expectedVersion },
            data: { status: 'PENDING_APPROVAL', version: { increment: 1 } },
            include: includeReceipt,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'GoodsReceipt',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'DRAFT -> PENDING_APPROVAL',
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async cancel(id, cancelReason, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        this.assertNotTracked(before, '这张入库单是按到货逐项确认的，要作废请取消对应的采购单');
        if (!['DRAFT', 'PENDING_APPROVAL', 'APPROVED'].includes(before.status)) {
            throw new common_1.BadRequestException(`入库单当前状态「${before.status}」不允许取消`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.goodsReceipt.update({
            where: { id, version: expectedVersion },
            data: { status: 'CANCELLED', cancelReason, version: { increment: 1 } },
            include: includeReceipt,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'GoodsReceipt',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `${before.status} -> CANCELLED：${cancelReason}`,
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async execute(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'APPROVED')
            throw new common_1.BadRequestException(`入库单当前状态「${before.status}」不允许执行`);
        this.assertNotTracked(before);
        const receiptWithItems = await this.prisma.goodsReceipt.findUniqueOrThrow({ where: { id }, include: { items: { include: { item: true } } } });
        const updated = await (0, versioned_update_util_1.retryOnVersionConflict)(() => this.prisma.$transaction(async (tx) => {
            const now = new Date();
            for (const line of receiptWithItems.items) {
                const existing = await tx.warehouseStock.findUnique({
                    where: { warehouseId_itemId: { warehouseId: before.warehouseId, itemId: line.itemId } },
                });
                const oldQuantity = existing?.quantity ?? 0;
                const oldAvgCost = existing?.avgCost ?? 0;
                const newQuantity = oldQuantity + line.quantity;
                const newAvgCost = newQuantity === 0 ? 0 : Math.round((oldQuantity * oldAvgCost + line.quantity * line.unitCost) / newQuantity);
                if (existing) {
                    await tx.warehouseStock.update({
                        where: { warehouseId_itemId: { warehouseId: before.warehouseId, itemId: line.itemId }, version: existing.version },
                        data: { quantity: newQuantity, avgCost: newAvgCost, version: { increment: 1 } },
                    });
                }
                else {
                    await tx.warehouseStock.create({
                        data: { warehouseId: before.warehouseId, itemId: line.itemId, quantity: newQuantity, avgCost: newAvgCost },
                    });
                }
                if (line.unitCost > 0)
                    await tx.inventoryItem.update({ where: { id: line.itemId }, data: { referencePrice: line.unitCost / 100 } });
                await tx.stockBatch.create({
                    data: {
                        tenantId: this.ctx.tenantId,
                        warehouseId: before.warehouseId,
                        itemId: line.itemId,
                        batchNo: (0, business_no_util_1.generateBusinessNo)('BAT'),
                        quantity: line.quantity,
                        unitCost: line.unitCost,
                        receivedAt: now,
                        expiresAt: line.item.shelfLifeDays ? (0, date_util_1.addDays)(now, line.item.shelfLifeDays) : null,
                        sourceType: 'GOODS_RECEIPT',
                        sourceId: before.id,
                    },
                });
            }
            return tx.goodsReceipt.update({
                where: { id },
                data: { status: 'COMPLETED', completedAt: now, version: { increment: 1 } },
                include: includeReceipt,
            });
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'GoodsReceipt',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'APPROVED -> COMPLETED（已更新库存与批次）',
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async receive(id, input) {
        const before = await this.findOneOrThrow(id);
        if (!before.tracked)
            throw new common_1.BadRequestException('这张入库单不是按到货逐项确认的');
        if (!['PENDING_RECEIPT', 'PARTIALLY_RECEIVED'].includes(before.status))
            throw new common_1.BadRequestException(`入库单当前状态「${before.status}」不能再收货`);
        if (!input.lines?.length)
            throw new common_1.BadRequestException('请至少填写一项到货数量');
        const seen = new Set();
        for (const l of input.lines) {
            if (seen.has(l.receiptItemId))
                throw new common_1.BadRequestException('同一个物品在这次收货里填了两次');
            seen.add(l.receiptItemId);
            if (!Number.isInteger(l.quantity) || l.quantity < 1)
                throw new common_1.BadRequestException('到货数量应为大于 0 的整数');
        }
        const updated = await (0, versioned_update_util_1.retryOnVersionConflict)(() => this.prisma.$transaction(async (tx) => {
            const receipt = await tx.goodsReceipt.findUniqueOrThrow({ where: { id }, include: { items: { include: { item: true } } } });
            const now = new Date();
            const confirmation = await tx.goodsReceiptConfirmation.create({
                data: { tenantId: this.ctx.tenantId, goodsReceiptId: id, confirmedById: this.ctx.accountId, confirmedAt: now, expressNo: input.expressNo?.trim() || null, note: input.note?.trim() || null },
            });
            for (const l of input.lines) {
                const line = receipt.items.find((i) => i.id === l.receiptItemId);
                if (!line)
                    throw new common_1.BadRequestException('收货的物品不属于这张入库单');
                const remaining = line.quantity - line.receivedQuantity;
                if (l.quantity > remaining) {
                    throw new common_1.BadRequestException(`「${line.item.name}」这次填了 ${l.quantity}，但采购 ${line.quantity}、已收 ${line.receivedQuantity}，最多还能收 ${remaining}。多收的货请联系采购员处理`);
                }
                const bumped = await tx.goodsReceiptItem.updateMany({ where: { id: line.id, receivedQuantity: line.receivedQuantity }, data: { receivedQuantity: { increment: l.quantity } } });
                if (bumped.count === 0)
                    throw new common_1.ConflictException('这几项刚刚被别人确认过收货，请刷新后再试');
                await this.stockIn(tx, { warehouseId: receipt.warehouseId, itemId: line.itemId, quantity: l.quantity, unitCost: line.unitCost, shelfLifeDays: line.item.shelfLifeDays, expiresAt: l.expiresAt ? new Date(l.expiresAt) : null, sourceId: receipt.id, now });
                await tx.goodsReceiptConfirmationLine.create({
                    data: { confirmationId: confirmation.id, goodsReceiptItemId: line.id, quantity: l.quantity, expiresAt: l.expiresAt ? new Date(l.expiresAt) : null, note: l.note?.trim() || null },
                });
            }
            const items = await tx.goodsReceiptItem.findMany({ where: { goodsReceiptId: id } });
            const done = items.every((i) => i.receivedQuantity >= i.quantity);
            if (receipt.purchaseOrderId) {
                await tx.purchaseOrder.update({ where: { id: receipt.purchaseOrderId }, data: { status: done ? 'COMPLETED' : 'PARTIALLY_RECEIVED', version: { increment: 1 } } });
            }
            return tx.goodsReceipt.update({
                where: { id },
                data: { status: done ? 'COMPLETED' : 'PARTIALLY_RECEIVED', completedAt: done ? now : null, version: { increment: 1 } },
                include: includeReceipt,
            });
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'GoodsReceipt',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `${before.status} -> ${updated.status}（收货确认：${input.lines.length} 项${input.expressNo ? `，快递 ${input.expressNo}` : ''}，已入库）`,
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async closeShort(id, reason) {
        const before = await this.findOneOrThrow(id);
        if (!before.tracked)
            throw new common_1.BadRequestException('这张入库单不是按到货逐项确认的');
        if (before.status !== 'PARTIALLY_RECEIVED')
            throw new common_1.BadRequestException('只有已经到过一部分货的入库单才能“结束收货”；一件都没到请取消采购单');
        if (!reason?.trim())
            throw new common_1.BadRequestException('请写明未到货的原因（如：缺货、供应商退款）');
        const updated = await this.prisma.$transaction(async (tx) => {
            if (before.purchaseOrderId)
                await tx.purchaseOrder.update({ where: { id: before.purchaseOrderId }, data: { status: 'COMPLETED', version: { increment: 1 } } });
            return tx.goodsReceipt.update({ where: { id }, data: { status: 'COMPLETED', completedAt: new Date(), shortClosedNote: reason.trim(), version: { increment: 1 } }, include: includeReceipt });
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'GoodsReceipt',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `PARTIALLY_RECEIVED -> COMPLETED（结束收货，未到货原因：${reason.trim()}）`,
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    assertNotTracked(receipt, msg = '这张入库单是按到货逐项确认的，请使用“收货确认”，不走提交/执行') {
        if (receipt.tracked)
            throw new common_1.BadRequestException(msg);
    }
    async stockIn(tx, p) {
        const existing = await tx.warehouseStock.findUnique({ where: { warehouseId_itemId: { warehouseId: p.warehouseId, itemId: p.itemId } } });
        const oldQuantity = existing?.quantity ?? 0;
        const oldAvgCost = existing?.avgCost ?? 0;
        const newQuantity = oldQuantity + p.quantity;
        const newAvgCost = newQuantity === 0 ? 0 : Math.round((oldQuantity * oldAvgCost + p.quantity * p.unitCost) / newQuantity);
        if (existing) {
            await tx.warehouseStock.update({
                where: { warehouseId_itemId: { warehouseId: p.warehouseId, itemId: p.itemId }, version: existing.version },
                data: { quantity: newQuantity, avgCost: newAvgCost, version: { increment: 1 } },
            });
        }
        else {
            await tx.warehouseStock.create({ data: { warehouseId: p.warehouseId, itemId: p.itemId, quantity: newQuantity, avgCost: newAvgCost } });
        }
        if (p.unitCost > 0)
            await tx.inventoryItem.update({ where: { id: p.itemId }, data: { referencePrice: p.unitCost / 100 } });
        await tx.stockBatch.create({
            data: {
                tenantId: this.ctx.tenantId,
                warehouseId: p.warehouseId,
                itemId: p.itemId,
                batchNo: (0, business_no_util_1.generateBusinessNo)('BAT'),
                quantity: p.quantity,
                unitCost: p.unitCost,
                receivedAt: p.now,
                expiresAt: p.expiresAt ?? (p.shelfLifeDays ? (0, date_util_1.addDays)(p.now, p.shelfLifeDays) : null),
                sourceType: 'GOODS_RECEIPT',
                sourceId: p.sourceId,
            },
        });
    }
    async reconcileStatus(receipt) {
        if (receipt.status !== 'PENDING_APPROVAL')
            return receipt;
        const instance = await this.prisma.workflowInstance.findFirst({
            where: { businessType: BUSINESS_TYPE, businessId: receipt.id },
            orderBy: { createdAt: 'desc' },
        });
        if (!instance)
            return receipt;
        let nextStatus = null;
        if (instance.status === 'APPROVED' || instance.status === 'ARCHIVED')
            nextStatus = 'APPROVED';
        else if (instance.status === 'REJECTED')
            nextStatus = 'REJECTED';
        else if (instance.status === 'WITHDRAWN')
            nextStatus = 'DRAFT';
        if (!nextStatus)
            return receipt;
        const updated = await this.prisma.goodsReceipt.update({
            where: { id: receipt.id },
            data: { status: nextStatus, version: { increment: 1 } },
            include: includeReceipt,
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'GoodsReceipt',
            entityId: receipt.id,
            beforeData: receipt,
            afterData: updated,
            remark: `PENDING_APPROVAL -> ${nextStatus}（同步自 WorkflowInstance ${instance.id}）`,
            ...this.auditCtx(receipt.storeId),
        });
        return updated;
    }
    assertVersion(before, expectedVersion) {
        if (before.version !== expectedVersion)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
    }
    actor() {
        return {
            accountId: this.ctx.accountId,
            tenantId: this.ctx.tenantId,
            storeId: this.ctx.homeStoreId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        };
    }
    auditCtx(storeId) {
        return {
            tenantId: this.ctx.tenantId,
            storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        };
    }
};
exports.GoodsReceiptService = GoodsReceiptService;
exports.GoodsReceiptService = GoodsReceiptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_engine_service_1.WorkflowEngineService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService,
        inventory_item_import_service_1.InventoryItemImportService])
], GoodsReceiptService);
//# sourceMappingURL=goods-receipt.service.js.map