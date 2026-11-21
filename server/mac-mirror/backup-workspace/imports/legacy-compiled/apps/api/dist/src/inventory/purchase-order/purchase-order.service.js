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
exports.PurchaseOrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const workflow_engine_service_1 = require("../../workflow/workflow-engine/workflow-engine.service");
const inventory_item_import_service_1 = require("../inventory-item/inventory-item-import.service");
const DEFINITION_CODE = 'INVENTORY_PURCHASE';
const BUSINESS_TYPE = 'PURCHASE_ORDER';
const includeOrder = {
    supplier: true,
    warehouse: true,
    items: { include: { item: true } },
    goodsReceipts: { select: { id: true, receiptNo: true, status: true, tracked: true } },
    shipments: { select: { id: true, logisticsState: true, expressNo: true } },
};
let PurchaseOrderService = class PurchaseOrderService {
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
        const orders = await this.prisma.purchaseOrder.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                storeId: query.storeId,
                warehouseId: query.warehouseId,
                supplierId: query.supplierId,
                status: query.status,
            },
            include: includeOrder,
            orderBy: { createdAt: 'desc' },
        });
        return Promise.all(orders.map((o) => this.reconcileStatus(o)));
    }
    async findOneOrThrow(id) {
        const order = await this.prisma.purchaseOrder.findUnique({ where: { id }, include: includeOrder });
        if (!order)
            throw new common_1.NotFoundException(`PurchaseOrder ${id} 不存在`);
        return this.reconcileStatus(order);
    }
    async create(dto, opts = {}) {
        const newOnes = dto.items.filter((i) => !i.itemId);
        for (const [idx, i] of dto.items.entries()) {
            if (!i.itemId && !i.newItem)
                throw new common_1.BadRequestException(`第 ${idx + 1} 行请选择物品，或填写新物品的名称和单位`);
        }
        if (newOnes.length > 0) {
            const made = await this.itemImport.ensureItems(newOnes.map((i, n) => ({ rowNo: n + 1, name: i.newItem.name, spec: i.newItem.spec ?? null, brand: i.newItem.brand ?? null, unit: i.newItem.unit, referencePrice: i.unitPrice > 0 ? i.unitPrice / 100 : null })), { createMissing: true, purpose: 'LOGISTICS' });
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
        const totalAmount = dto.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        const created = await this.prisma.$transaction(async (tx) => {
            const order = await tx.purchaseOrder.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId: dto.storeId,
                    warehouseId: dto.warehouseId,
                    supplierId: dto.supplierId,
                    orderNo: (0, business_no_util_1.generateBusinessNo)('CG'),
                    totalAmount,
                    status: opts.autoApprove ? 'APPROVED' : undefined,
                    remark: dto.remark,
                    createdBy: this.ctx.accountId,
                },
            });
            await tx.purchaseOrderItem.createMany({
                data: dto.items.map((i) => ({
                    purchaseOrderId: order.id,
                    itemId: i.itemId,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    subtotal: i.quantity * i.unitPrice,
                })),
            });
            return order;
        });
        const withItems = await this.findOneOrThrow(created.id);
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'PurchaseOrder',
            entityId: created.id,
            afterData: withItems,
            remark: opts.autoApprove ? '由已批准的申购单生成，无需再审批，待采购员采购' : undefined,
            ...this.auditCtx(dto.storeId),
        });
        return withItems;
    }
    async confirmPurchase(id, input, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'APPROVED')
            throw new common_1.BadRequestException(`采购单当前状态「${before.status}」不能确认采购（只有“待采购”的采购单可以）`);
        const order = await this.prisma.purchaseOrder.findUniqueOrThrow({ where: { id }, include: { items: true } });
        const result = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.purchaseOrder.update({
                where: { id, version: expectedVersion },
                data: {
                    status: 'PURCHASED',
                    purchasedAt: new Date(),
                    purchasedById: this.ctx.accountId,
                    expressNo: input.expressNo?.trim() || null,
                    purchaseNote: input.note?.trim() || null,
                    version: { increment: 1 },
                },
                include: includeOrder,
            });
            const receipt = await tx.goodsReceipt.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId: order.storeId,
                    warehouseId: order.warehouseId,
                    purchaseOrderId: order.id,
                    receiptNo: (0, business_no_util_1.generateBusinessNo)('RK'),
                    status: 'PENDING_RECEIPT',
                    tracked: true,
                    remark: `由采购单 ${order.orderNo} 确认采购后自动生成，等快递到货后逐项确认收货`,
                    createdBy: this.ctx.accountId,
                    items: { create: order.items.map((i) => ({ itemId: i.itemId, quantity: i.quantity, unitCost: i.unitPrice })) },
                },
            });
            return { updated, receipt };
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'PurchaseOrder',
            entityId: id,
            beforeData: before,
            afterData: result.updated,
            remark: `APPROVED -> PURCHASED（采购员确认采购，已生成入库单 ${result.receipt.receiptNo}）`,
            ...this.auditCtx(before.storeId),
        });
        return { order: result.updated, receipt: result.receipt };
    }
    async submit(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'DRAFT')
            throw new common_1.BadRequestException(`采购单当前状态「${before.status}」不允许提交`);
        await this.workflowEngineService.startInstance({ definitionCode: DEFINITION_CODE, businessType: BUSINESS_TYPE, businessId: id, title: before.orderNo, storeId: before.storeId }, this.actor());
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.purchaseOrder.update({
            where: { id, version: expectedVersion },
            data: { status: 'PENDING_APPROVAL', version: { increment: 1 } },
            include: includeOrder,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'PurchaseOrder',
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
        if (!['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PURCHASED'].includes(before.status)) {
            throw new common_1.BadRequestException(`采购单当前状态「${before.status}」不允许取消`);
        }
        if (before.status === 'PURCHASED') {
            const received = await this.prisma.goodsReceiptItem.aggregate({ where: { goodsReceipt: { purchaseOrderId: id, tracked: true } }, _sum: { receivedQuantity: true } });
            if ((received._sum.receivedQuantity ?? 0) > 0)
                throw new common_1.BadRequestException('已经有货品到货入库，不能取消采购单');
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.$transaction(async (tx) => {
            await tx.goodsReceipt.updateMany({ where: { purchaseOrderId: id, tracked: true, status: { in: ['PENDING_RECEIPT'] } }, data: { status: 'CANCELLED', cancelReason: `采购单已取消：${cancelReason}` } });
            return tx.purchaseOrder.update({
                where: { id, version: expectedVersion },
                data: { status: 'CANCELLED', cancelReason, version: { increment: 1 } },
                include: includeOrder,
            });
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'PurchaseOrder',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `${before.status} -> CANCELLED：${cancelReason}`,
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async reconcileStatus(order) {
        if (order.status !== 'PENDING_APPROVAL')
            return order;
        const instance = await this.prisma.workflowInstance.findFirst({
            where: { businessType: BUSINESS_TYPE, businessId: order.id },
            orderBy: { createdAt: 'desc' },
        });
        if (!instance)
            return order;
        let nextStatus = null;
        if (instance.status === 'APPROVED' || instance.status === 'ARCHIVED')
            nextStatus = 'APPROVED';
        else if (instance.status === 'REJECTED')
            nextStatus = 'REJECTED';
        else if (instance.status === 'WITHDRAWN')
            nextStatus = 'DRAFT';
        if (!nextStatus)
            return order;
        const updated = await this.prisma.purchaseOrder.update({
            where: { id: order.id },
            data: { status: nextStatus, version: { increment: 1 } },
            include: includeOrder,
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'PurchaseOrder',
            entityId: order.id,
            beforeData: order,
            afterData: updated,
            remark: `PENDING_APPROVAL -> ${nextStatus}（同步自 WorkflowInstance ${instance.id}）`,
            ...this.auditCtx(order.storeId),
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
exports.PurchaseOrderService = PurchaseOrderService;
exports.PurchaseOrderService = PurchaseOrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_engine_service_1.WorkflowEngineService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService,
        inventory_item_import_service_1.InventoryItemImportService])
], PurchaseOrderService);
//# sourceMappingURL=purchase-order.service.js.map