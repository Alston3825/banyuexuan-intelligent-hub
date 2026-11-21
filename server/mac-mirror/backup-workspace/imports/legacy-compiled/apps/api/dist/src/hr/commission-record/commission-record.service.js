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
exports.CommissionRecordService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const workflow_engine_service_1 = require("../../workflow/workflow-engine/workflow-engine.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const DEFINITION_CODE = 'HR_COMMISSION';
const BUSINESS_TYPE = 'COMMISSION_RECORD';
const includeRecord = { allocations: { include: { employeeProfile: { include: { account: { select: { id: true, realName: true } } } } } } };
let CommissionRecordService = class CommissionRecordService {
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
        const records = await this.prisma.commissionRecord.findMany({
            where: { tenantId: this.ctx.tenantId, storeId: query.storeId, type: query.type, status: query.status },
            include: includeRecord,
            orderBy: { createdAt: 'desc' },
        });
        return Promise.all(records.map((r) => this.reconcileStatus(r)));
    }
    async findOneOrThrow(id) {
        const record = await this.prisma.commissionRecord.findUnique({ where: { id }, include: includeRecord });
        if (!record)
            throw new common_1.NotFoundException(`CommissionRecord ${id} 不存在`);
        return this.reconcileStatus(record);
    }
    async create(dto) {
        const employeeIds = [...new Set(dto.allocations.map((a) => a.employeeProfileId))];
        const employees = await this.prisma.employeeProfile.findMany({ where: { id: { in: employeeIds } } });
        if (employees.length !== employeeIds.length)
            throw new common_1.BadRequestException('存在不存在的员工档案 ID');
        const rawShares = dto.allocations.map((a) => (dto.totalAmount * a.basisPoints) / 10000);
        const intendedTotal = Math.round(rawShares.reduce((sum, x) => sum + x, 0));
        let allocatedSoFar = 0;
        const allocationsWithAmount = dto.allocations.map((a, idx) => {
            const isLast = idx === dto.allocations.length - 1;
            const amount = isLast ? intendedTotal - allocatedSoFar : Math.round(rawShares[idx]);
            allocatedSoFar += amount;
            return { ...a, amount };
        });
        const allocatedTotal = allocatedSoFar;
        if (allocatedTotal > dto.totalAmount) {
            throw new common_1.BadRequestException(`分配明细合计金额（${allocatedTotal}）超出提成总金额（${dto.totalAmount}）`);
        }
        const created = await this.prisma.$transaction(async (tx) => {
            const record = await tx.commissionRecord.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId: dto.storeId,
                    type: dto.type,
                    sourceType: dto.sourceType,
                    sourceId: dto.sourceId,
                    totalAmount: dto.totalAmount,
                    remark: dto.remark,
                    createdBy: this.ctx.accountId,
                },
            });
            await tx.commissionAllocation.createMany({
                data: allocationsWithAmount.map((a) => ({
                    commissionRecordId: record.id,
                    employeeProfileId: a.employeeProfileId,
                    roleLabel: a.roleLabel,
                    basisPoints: a.basisPoints,
                    amount: a.amount,
                })),
            });
            return record;
        });
        const withAllocations = await this.findOneOrThrow(created.id);
        await this.auditLogService.record({ action: 'CREATE', entityType: 'CommissionRecord', entityId: created.id, afterData: withAllocations, ...this.auditCtx(dto.storeId) });
        return withAllocations;
    }
    async submit(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'DRAFT')
            throw new common_1.BadRequestException(`提成记录当前状态「${before.status}」不允许提交`);
        await this.workflowEngineService.startInstance({ definitionCode: DEFINITION_CODE, businessType: BUSINESS_TYPE, businessId: id, title: `${before.type === 'SALES' ? '业绩提成' : '手工费'}-${id}`, storeId: before.storeId }, this.actor());
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.commissionRecord.update({
            where: { id, version: expectedVersion },
            data: { status: 'PENDING_APPROVAL', version: { increment: 1 } },
            include: includeRecord,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'CommissionRecord',
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
            throw new common_1.BadRequestException(`提成记录当前状态「${before.status}」不允许取消`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.commissionRecord.update({
            where: { id, version: expectedVersion },
            data: { status: 'CANCELLED', cancelReason, version: { increment: 1 } },
            include: includeRecord,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'CommissionRecord',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `${before.status} -> CANCELLED：${cancelReason}`,
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async reconcileStatus(record) {
        if (record.status !== 'PENDING_APPROVAL')
            return record;
        const instance = await this.prisma.workflowInstance.findFirst({
            where: { businessType: BUSINESS_TYPE, businessId: record.id },
            orderBy: { createdAt: 'desc' },
        });
        if (!instance)
            return record;
        let nextStatus = null;
        if (instance.status === 'APPROVED' || instance.status === 'ARCHIVED')
            nextStatus = 'APPROVED';
        else if (instance.status === 'REJECTED')
            nextStatus = 'REJECTED';
        else if (instance.status === 'WITHDRAWN')
            nextStatus = 'DRAFT';
        if (!nextStatus)
            return record;
        const updated = await this.prisma.commissionRecord.update({
            where: { id: record.id },
            data: { status: nextStatus, version: { increment: 1 } },
            include: includeRecord,
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'CommissionRecord',
            entityId: record.id,
            beforeData: record,
            afterData: updated,
            remark: `PENDING_APPROVAL -> ${nextStatus}（同步自 WorkflowInstance ${instance.id}）`,
            ...this.auditCtx(record.storeId),
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
exports.CommissionRecordService = CommissionRecordService;
exports.CommissionRecordService = CommissionRecordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_engine_service_1.WorkflowEngineService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CommissionRecordService);
//# sourceMappingURL=commission-record.service.js.map