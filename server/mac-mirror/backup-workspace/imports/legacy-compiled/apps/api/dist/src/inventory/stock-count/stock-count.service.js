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
exports.StockCountService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const date_util_1 = require("../../common/utils/date.util");
const workflow_engine_service_1 = require("../../workflow/workflow-engine/workflow-engine.service");
const fefo_batch_util_1 = require("../common/fefo-batch.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const DEFINITION_CODE = 'INVENTORY_STOCK_COUNT';
const BUSINESS_TYPE = 'STOCK_COUNT';
const includeCount = { warehouse: true, items: { include: { item: true } } };
let StockCountService = class StockCountService {
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
        const counts = await this.prisma.stockCount.findMany({
            where: { tenantId: this.ctx.tenantId, storeId: query.storeId, warehouseId: query.warehouseId, status: query.status },
            include: includeCount,
            orderBy: { createdAt: 'desc' },
        });
        return Promise.all(counts.map((c) => this.reconcileStatus(c)));
    }
    async findOneOrThrow(id) {
        const count = await this.prisma.stockCount.findUnique({ where: { id }, include: includeCount });
        if (!count)
            throw new common_1.NotFoundException(`StockCount ${id} 不存在`);
        return this.reconcileStatus(count);
    }
    async create(dto) {
        const itemIds = [...new Set(dto.items.map((i) => i.itemId))];
        const items = await this.prisma.inventoryItem.findMany({ where: { id: { in: itemIds } } });
        if (items.length !== itemIds.length)
            throw new common_1.BadRequestException('存在不存在的物品 ID');
        const created = await this.prisma.$transaction(async (tx) => {
            const count = await tx.stockCount.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId: dto.storeId,
                    warehouseId: dto.warehouseId,
                    countNo: (0, business_no_util_1.generateBusinessNo)('PD'),
                    remark: dto.remark,
                    createdBy: this.ctx.accountId,
                },
            });
            for (const line of dto.items) {
                const stock = await tx.warehouseStock.findUnique({ where: { warehouseId_itemId: { warehouseId: dto.warehouseId, itemId: line.itemId } } });
                const systemQuantity = stock?.quantity ?? 0;
                await tx.stockCountItem.create({
                    data: {
                        stockCountId: count.id,
                        itemId: line.itemId,
                        systemQuantity,
                        countedQuantity: line.countedQuantity,
                        diffQuantity: line.countedQuantity - systemQuantity,
                    },
                });
            }
            return count;
        });
        const withItems = await this.findOneOrThrow(created.id);
        await this.auditLogService.record({ action: 'CREATE', entityType: 'StockCount', entityId: created.id, afterData: withItems, ...this.auditCtx(dto.storeId) });
        return withItems;
    }
    async submit(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'DRAFT')
            throw new common_1.BadRequestException(`盘点单当前状态「${before.status}」不允许提交`);
        const warehouse = await this.prisma.warehouse.findUniqueOrThrow({ where: { id: before.warehouseId } });
        if (!warehouse.requiresApproval) {
            const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.stockCount.update({
                where: { id, version: expectedVersion },
                data: { status: 'APPROVED', version: { increment: 1 } },
                include: includeCount,
            }));
            await this.auditLogService.record({
                action: 'STATE_TRANSITION',
                entityType: 'StockCount',
                entityId: id,
                beforeData: before,
                afterData: updated,
                remark: 'DRAFT -> APPROVED（仓库免审批）',
                ...this.auditCtx(before.storeId),
            });
            return updated;
        }
        await this.workflowEngineService.startInstance({ definitionCode: DEFINITION_CODE, businessType: BUSINESS_TYPE, businessId: id, title: before.countNo, storeId: before.storeId }, this.actor());
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.stockCount.update({
            where: { id, version: expectedVersion },
            data: { status: 'PENDING_APPROVAL', version: { increment: 1 } },
            include: includeCount,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'StockCount',
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
        if (!['DRAFT', 'PENDING_APPROVAL', 'APPROVED'].includes(before.status)) {
            throw new common_1.BadRequestException(`盘点单当前状态「${before.status}」不允许取消`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.stockCount.update({
            where: { id, version: expectedVersion },
            data: { status: 'CANCELLED', cancelReason, version: { increment: 1 } },
            include: includeCount,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'StockCount',
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
            throw new common_1.BadRequestException(`盘点单当前状态「${before.status}」不允许执行`);
        const countWithItems = await this.prisma.stockCount.findUniqueOrThrow({ where: { id }, include: { items: { include: { item: true } } } });
        const updated = await (0, versioned_update_util_1.retryOnVersionConflict)(() => this.prisma.$transaction(async (tx) => {
            const now = new Date();
            for (const line of countWithItems.items) {
                if (line.diffQuantity === 0)
                    continue;
                const stock = await tx.warehouseStock.findUnique({ where: { warehouseId_itemId: { warehouseId: before.warehouseId, itemId: line.itemId } } });
                const avgCost = stock?.avgCost ?? 0;
                if (stock) {
                    await tx.warehouseStock.update({
                        where: { warehouseId_itemId: { warehouseId: before.warehouseId, itemId: line.itemId }, version: stock.version },
                        data: { quantity: line.countedQuantity, version: { increment: 1 } },
                    });
                }
                else {
                    await tx.warehouseStock.create({
                        data: { warehouseId: before.warehouseId, itemId: line.itemId, quantity: line.countedQuantity, avgCost },
                    });
                }
                if (line.diffQuantity > 0) {
                    await tx.stockBatch.create({
                        data: {
                            tenantId: this.ctx.tenantId,
                            warehouseId: before.warehouseId,
                            itemId: line.itemId,
                            batchNo: (0, business_no_util_1.generateBusinessNo)('BAT'),
                            quantity: line.diffQuantity,
                            unitCost: avgCost,
                            receivedAt: now,
                            expiresAt: line.item.shelfLifeDays ? (0, date_util_1.addDays)(now, line.item.shelfLifeDays) : null,
                            sourceType: 'STOCK_COUNT',
                            sourceId: before.id,
                        },
                    });
                }
                else {
                    await (0, fefo_batch_util_1.consumeBatchesFefo)(tx, before.warehouseId, line.itemId, -line.diffQuantity);
                }
            }
            return tx.stockCount.update({
                where: { id, version: expectedVersion },
                data: { status: 'COMPLETED', completedAt: now, version: { increment: 1 } },
                include: includeCount,
            });
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'StockCount',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'APPROVED -> COMPLETED（已修正库存与批次）',
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async reconcileStatus(count) {
        if (count.status !== 'PENDING_APPROVAL')
            return count;
        const instance = await this.prisma.workflowInstance.findFirst({
            where: { businessType: BUSINESS_TYPE, businessId: count.id },
            orderBy: { createdAt: 'desc' },
        });
        if (!instance)
            return count;
        let nextStatus = null;
        if (instance.status === 'APPROVED' || instance.status === 'ARCHIVED')
            nextStatus = 'APPROVED';
        else if (instance.status === 'REJECTED')
            nextStatus = 'REJECTED';
        else if (instance.status === 'WITHDRAWN')
            nextStatus = 'DRAFT';
        if (!nextStatus)
            return count;
        const updated = await this.prisma.stockCount.update({
            where: { id: count.id },
            data: { status: nextStatus, version: { increment: 1 } },
            include: includeCount,
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'StockCount',
            entityId: count.id,
            beforeData: count,
            afterData: updated,
            remark: `PENDING_APPROVAL -> ${nextStatus}（同步自 WorkflowInstance ${instance.id}）`,
            ...this.auditCtx(count.storeId),
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
exports.StockCountService = StockCountService;
exports.StockCountService = StockCountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_engine_service_1.WorkflowEngineService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], StockCountService);
//# sourceMappingURL=stock-count.service.js.map