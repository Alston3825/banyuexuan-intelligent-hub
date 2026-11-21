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
exports.StockTransferService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const workflow_engine_service_1 = require("../../workflow/workflow-engine/workflow-engine.service");
const fefo_batch_util_1 = require("../common/fefo-batch.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const DEFINITION_CODE = 'INVENTORY_STOCK_TRANSFER';
const BUSINESS_TYPE = 'STOCK_TRANSFER';
const includeTransfer = { fromWarehouse: true, toWarehouse: true, items: { include: { item: true } } };
let StockTransferService = class StockTransferService {
    prisma;
    workflowEngineService;
    auditLogService;
    ctx;
    constructor(prisma, workflowEngineService, auditLogService, ctx) {
        this.prisma = prisma;
        this.workflowEngineService = workflowEngineService;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    async findMany(query = {}) {
        const transfers = await this.prisma.stockTransfer.findMany({
            where: { tenantId: this.ctx.tenantId, fromWarehouseId: query.fromWarehouseId, toWarehouseId: query.toWarehouseId, status: query.status },
            include: includeTransfer,
            orderBy: { createdAt: 'desc' },
        });
        return Promise.all(transfers.map((t) => this.reconcileStatus(t)));
    }
    async findOneOrThrow(id) {
        const transfer = await this.prisma.stockTransfer.findUnique({ where: { id }, include: includeTransfer });
        if (!transfer)
            throw new common_1.NotFoundException(`StockTransfer ${id} 不存在`);
        return this.reconcileStatus(transfer);
    }
    async create(dto) {
        if (dto.fromWarehouseId === dto.toWarehouseId)
            throw new common_1.BadRequestException('调出仓库与调入仓库不能相同');
        const itemIds = [...new Set(dto.items.map((i) => i.itemId))];
        const items = await this.prisma.inventoryItem.findMany({ where: { id: { in: itemIds } } });
        if (items.length !== itemIds.length)
            throw new common_1.BadRequestException('存在不存在的物品 ID');
        for (const line of dto.items) {
            const stock = await this.prisma.warehouseStock.findUnique({ where: { warehouseId_itemId: { warehouseId: dto.fromWarehouseId, itemId: line.itemId } } });
            if (!stock || stock.quantity < line.quantity) {
                const item = items.find((it) => it.id === line.itemId);
                throw new common_1.BadRequestException(`物品「${item.name}」在调出仓库的库存不足（现有 ${stock?.quantity ?? 0}，需要 ${line.quantity}）`);
            }
        }
        const created = await this.prisma.$transaction(async (tx) => {
            const transfer = await tx.stockTransfer.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    fromWarehouseId: dto.fromWarehouseId,
                    toWarehouseId: dto.toWarehouseId,
                    transferNo: (0, business_no_util_1.generateBusinessNo)('DB'),
                    remark: dto.remark,
                    createdBy: this.ctx.accountId,
                },
            });
            await tx.stockTransferItem.createMany({ data: dto.items.map((i) => ({ stockTransferId: transfer.id, itemId: i.itemId, quantity: i.quantity })) });
            return transfer;
        });
        const withItems = await this.findOneOrThrow(created.id);
        await this.auditLogService.record({ action: 'CREATE', entityType: 'StockTransfer', entityId: created.id, afterData: withItems, ...(await this.auditCtx(created.fromWarehouseId)) });
        return withItems;
    }
    async submit(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'DRAFT')
            throw new common_1.BadRequestException(`调拨单当前状态「${before.status}」不允许提交`);
        const fromWarehouse = await this.prisma.warehouse.findUniqueOrThrow({ where: { id: before.fromWarehouseId } });
        if (!fromWarehouse.requiresApproval) {
            const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.stockTransfer.update({
                where: { id, version: expectedVersion },
                data: { status: 'APPROVED', version: { increment: 1 } },
                include: includeTransfer,
            }));
            await this.auditLogService.record({
                action: 'STATE_TRANSITION',
                entityType: 'StockTransfer',
                entityId: id,
                beforeData: before,
                afterData: updated,
                remark: 'DRAFT -> APPROVED（源仓库免审批）',
                ...(await this.auditCtx(before.fromWarehouseId)),
            });
            return updated;
        }
        await this.workflowEngineService.startInstance({ definitionCode: DEFINITION_CODE, businessType: BUSINESS_TYPE, businessId: id, title: before.transferNo, storeId: fromWarehouse.storeId }, this.actor());
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.stockTransfer.update({
            where: { id, version: expectedVersion },
            data: { status: 'PENDING_APPROVAL', version: { increment: 1 } },
            include: includeTransfer,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'StockTransfer',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'DRAFT -> PENDING_APPROVAL',
            ...(await this.auditCtx(before.fromWarehouseId)),
        });
        return updated;
    }
    async cancel(id, cancelReason, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (!['DRAFT', 'PENDING_APPROVAL', 'APPROVED'].includes(before.status)) {
            throw new common_1.BadRequestException(`调拨单当前状态「${before.status}」不允许取消`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.stockTransfer.update({
            where: { id, version: expectedVersion },
            data: { status: 'CANCELLED', cancelReason, version: { increment: 1 } },
            include: includeTransfer,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'StockTransfer',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `${before.status} -> CANCELLED：${cancelReason}`,
            ...(await this.auditCtx(before.fromWarehouseId)),
        });
        return updated;
    }
    async execute(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'APPROVED')
            throw new common_1.BadRequestException(`调拨单当前状态「${before.status}」不允许执行`);
        const transferWithItems = await this.prisma.stockTransfer.findUniqueOrThrow({ where: { id }, include: { items: true } });
        const updated = await (0, versioned_update_util_1.retryOnVersionConflict)(() => this.prisma.$transaction(async (tx) => {
            const now = new Date();
            for (const line of transferWithItems.items) {
                const fromStock = await tx.warehouseStock.findUnique({ where: { warehouseId_itemId: { warehouseId: before.fromWarehouseId, itemId: line.itemId } } });
                if (!fromStock || fromStock.quantity < line.quantity) {
                    throw new common_1.BadRequestException('执行时调出仓库库存不足（可能与其他单据并发冲突），请重新核对后再试');
                }
                const transferUnitCost = fromStock.avgCost;
                try {
                    await tx.warehouseStock.update({
                        where: { warehouseId_itemId: { warehouseId: before.fromWarehouseId, itemId: line.itemId }, quantity: { gte: line.quantity } },
                        data: { quantity: { decrement: line.quantity } },
                    });
                }
                catch (err) {
                    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                        throw new common_1.BadRequestException('执行时调出仓库库存不足（可能与其他单据并发冲突），请重新核对后再试');
                    }
                    throw err;
                }
                const consumedBatches = await (0, fefo_batch_util_1.consumeBatchesFefo)(tx, before.fromWarehouseId, line.itemId, line.quantity);
                const toStock = await tx.warehouseStock.findUnique({ where: { warehouseId_itemId: { warehouseId: before.toWarehouseId, itemId: line.itemId } } });
                const oldToQuantity = toStock?.quantity ?? 0;
                const oldToAvgCost = toStock?.avgCost ?? 0;
                const newToQuantity = oldToQuantity + line.quantity;
                const newToAvgCost = newToQuantity === 0 ? 0 : Math.round((oldToQuantity * oldToAvgCost + line.quantity * transferUnitCost) / newToQuantity);
                if (toStock) {
                    await tx.warehouseStock.update({
                        where: { warehouseId_itemId: { warehouseId: before.toWarehouseId, itemId: line.itemId }, version: toStock.version },
                        data: { quantity: newToQuantity, avgCost: newToAvgCost, version: { increment: 1 } },
                    });
                }
                else {
                    await tx.warehouseStock.create({
                        data: { warehouseId: before.toWarehouseId, itemId: line.itemId, quantity: newToQuantity, avgCost: newToAvgCost },
                    });
                }
                for (const consumed of consumedBatches) {
                    await tx.stockBatch.create({
                        data: {
                            tenantId: this.ctx.tenantId,
                            warehouseId: before.toWarehouseId,
                            itemId: line.itemId,
                            batchNo: (0, business_no_util_1.generateBusinessNo)('BAT'),
                            quantity: consumed.quantity,
                            unitCost: consumed.unitCost,
                            receivedAt: now,
                            expiresAt: consumed.expiresAt,
                            sourceType: 'STOCK_TRANSFER',
                            sourceId: before.id,
                        },
                    });
                }
            }
            return tx.stockTransfer.update({
                where: { id, version: expectedVersion },
                data: { status: 'COMPLETED', completedAt: now, version: { increment: 1 } },
                include: includeTransfer,
            });
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'StockTransfer',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'APPROVED -> COMPLETED（已完成库存与批次搬家）',
            ...(await this.auditCtx(before.fromWarehouseId)),
        });
        return updated;
    }
    async reconcileStatus(transfer) {
        if (transfer.status !== 'PENDING_APPROVAL')
            return transfer;
        const instance = await this.prisma.workflowInstance.findFirst({
            where: { businessType: BUSINESS_TYPE, businessId: transfer.id },
            orderBy: { createdAt: 'desc' },
        });
        if (!instance)
            return transfer;
        let nextStatus = null;
        if (instance.status === 'APPROVED' || instance.status === 'ARCHIVED')
            nextStatus = 'APPROVED';
        else if (instance.status === 'REJECTED')
            nextStatus = 'REJECTED';
        else if (instance.status === 'WITHDRAWN')
            nextStatus = 'DRAFT';
        if (!nextStatus)
            return transfer;
        const updated = await this.prisma.stockTransfer.update({
            where: { id: transfer.id },
            data: { status: nextStatus, version: { increment: 1 } },
            include: includeTransfer,
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'StockTransfer',
            entityId: transfer.id,
            beforeData: transfer,
            afterData: updated,
            remark: `PENDING_APPROVAL -> ${nextStatus}（同步自 WorkflowInstance ${instance.id}）`,
            ...(await this.auditCtx(transfer.fromWarehouseId)),
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
    async auditCtx(fromWarehouseId) {
        const warehouse = await this.prisma.warehouse.findUnique({ where: { id: fromWarehouseId } });
        return {
            tenantId: this.ctx.tenantId,
            storeId: warehouse?.storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        };
    }
};
exports.StockTransferService = StockTransferService;
exports.StockTransferService = StockTransferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_engine_service_1.WorkflowEngineService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], StockTransferService);
//# sourceMappingURL=stock-transfer.service.js.map