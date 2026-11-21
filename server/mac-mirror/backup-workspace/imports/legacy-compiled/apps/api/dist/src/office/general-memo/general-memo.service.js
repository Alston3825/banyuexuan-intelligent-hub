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
exports.GeneralMemoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const workflow_engine_service_1 = require("../../workflow/workflow-engine/workflow-engine.service");
const DEFINITION_CODE = 'OFFICE_MEMO';
const BUSINESS_TYPE = 'GENERAL_MEMO';
const includeMemo = { applicant: { select: { id: true, realName: true } } };
let GeneralMemoService = class GeneralMemoService {
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
        const memos = await this.prisma.generalMemo.findMany({
            where: { tenantId: this.ctx.tenantId, storeId: query.storeId, applicantId: query.applicantId, status: query.status },
            include: includeMemo,
            orderBy: { createdAt: 'desc' },
        });
        return Promise.all(memos.map((m) => this.reconcileStatus(m)));
    }
    async findOneOrThrow(id) {
        const memo = await this.prisma.generalMemo.findUnique({ where: { id }, include: includeMemo });
        if (!memo)
            throw new common_1.NotFoundException(`GeneralMemo ${id} 不存在`);
        return this.reconcileStatus(memo);
    }
    async create(dto) {
        const created = await this.prisma.generalMemo.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: dto.storeId,
                applicantId: this.ctx.accountId,
                title: dto.title,
                content: dto.content,
                createdBy: this.ctx.accountId,
            },
            include: includeMemo,
        });
        await this.auditLogService.record({ action: 'CREATE', entityType: 'GeneralMemo', entityId: created.id, afterData: created, ...this.auditCtx(dto.storeId) });
        return created;
    }
    async submit(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'DRAFT')
            throw new common_1.BadRequestException(`签呈当前状态「${before.status}」不允许提交`);
        await this.workflowEngineService.startInstance({ definitionCode: DEFINITION_CODE, businessType: BUSINESS_TYPE, businessId: id, title: before.title, storeId: before.storeId }, this.actor());
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.generalMemo.update({ where: { id, version: expectedVersion }, data: { status: 'PENDING_APPROVAL', version: { increment: 1 } }, include: includeMemo }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'GeneralMemo',
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
            throw new common_1.BadRequestException(`签呈当前状态「${before.status}」不允许取消`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.generalMemo.update({
            where: { id, version: expectedVersion },
            data: { status: 'CANCELLED', cancelReason, version: { increment: 1 } },
            include: includeMemo,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'GeneralMemo',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `${before.status} -> CANCELLED：${cancelReason}`,
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async reconcileStatus(memo) {
        if (memo.status !== 'PENDING_APPROVAL')
            return memo;
        const instance = await this.prisma.workflowInstance.findFirst({
            where: { businessType: BUSINESS_TYPE, businessId: memo.id },
            orderBy: { createdAt: 'desc' },
        });
        if (!instance)
            return memo;
        let nextStatus = null;
        if (instance.status === 'APPROVED' || instance.status === 'ARCHIVED')
            nextStatus = 'APPROVED';
        else if (instance.status === 'REJECTED')
            nextStatus = 'REJECTED';
        else if (instance.status === 'WITHDRAWN')
            nextStatus = 'DRAFT';
        if (!nextStatus)
            return memo;
        const updated = await this.prisma.generalMemo.update({
            where: { id: memo.id },
            data: { status: nextStatus, version: { increment: 1 } },
            include: includeMemo,
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'GeneralMemo',
            entityId: memo.id,
            beforeData: memo,
            afterData: updated,
            remark: `PENDING_APPROVAL -> ${nextStatus}（同步自 WorkflowInstance ${instance.id}）`,
            ...this.auditCtx(memo.storeId),
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
exports.GeneralMemoService = GeneralMemoService;
exports.GeneralMemoService = GeneralMemoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_engine_service_1.WorkflowEngineService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], GeneralMemoService);
//# sourceMappingURL=general-memo.service.js.map