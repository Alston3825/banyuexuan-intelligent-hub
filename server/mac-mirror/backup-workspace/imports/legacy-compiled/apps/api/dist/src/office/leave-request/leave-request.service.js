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
exports.LeaveRequestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const workflow_engine_service_1 = require("../../workflow/workflow-engine/workflow-engine.service");
const DEFINITION_CODE = 'OFFICE_LEAVE';
const BUSINESS_TYPE = 'LEAVE_REQUEST';
const includeRequest = { employeeProfile: { include: { account: { select: { id: true, realName: true } } } } };
let LeaveRequestService = class LeaveRequestService {
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
        const requests = await this.prisma.leaveRequest.findMany({
            where: { tenantId: this.ctx.tenantId, storeId: query.storeId, employeeProfileId: query.employeeProfileId, status: query.status },
            include: includeRequest,
            orderBy: { createdAt: 'desc' },
        });
        return Promise.all(requests.map((r) => this.reconcileStatus(r)));
    }
    async findOneOrThrow(id) {
        const request = await this.prisma.leaveRequest.findUnique({ where: { id }, include: includeRequest });
        if (!request)
            throw new common_1.NotFoundException(`LeaveRequest ${id} 不存在`);
        return this.reconcileStatus(request);
    }
    async create(dto) {
        const employee = await this.prisma.employeeProfile.findUnique({ where: { id: dto.employeeProfileId } });
        if (!employee)
            throw new common_1.NotFoundException(`EmployeeProfile ${dto.employeeProfileId} 不存在`);
        if (new Date(dto.endDate) < new Date(dto.startDate)) {
            throw new common_1.BadRequestException('结束日期不能早于开始日期');
        }
        const created = await this.prisma.leaveRequest.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: dto.storeId,
                employeeProfileId: dto.employeeProfileId,
                leaveType: dto.leaveType,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                reason: dto.reason,
                createdBy: this.ctx.accountId,
            },
            include: includeRequest,
        });
        await this.auditLogService.record({ action: 'CREATE', entityType: 'LeaveRequest', entityId: created.id, afterData: created, ...this.auditCtx(dto.storeId) });
        return created;
    }
    async submit(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'DRAFT')
            throw new common_1.BadRequestException(`请假申请当前状态「${before.status}」不允许提交`);
        await this.workflowEngineService.startInstance({ definitionCode: DEFINITION_CODE, businessType: BUSINESS_TYPE, businessId: id, title: `请假申请-${id}`, storeId: before.storeId }, this.actor());
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.leaveRequest.update({ where: { id, version: expectedVersion }, data: { status: 'PENDING_APPROVAL', version: { increment: 1 } }, include: includeRequest }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'LeaveRequest',
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
            throw new common_1.BadRequestException(`请假申请当前状态「${before.status}」不允许取消`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.leaveRequest.update({
            where: { id, version: expectedVersion },
            data: { status: 'CANCELLED', cancelReason, version: { increment: 1 } },
            include: includeRequest,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'LeaveRequest',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `${before.status} -> CANCELLED：${cancelReason}`,
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async reconcileStatus(request) {
        if (request.status !== 'PENDING_APPROVAL')
            return request;
        const instance = await this.prisma.workflowInstance.findFirst({
            where: { businessType: BUSINESS_TYPE, businessId: request.id },
            orderBy: { createdAt: 'desc' },
        });
        if (!instance)
            return request;
        let nextStatus = null;
        if (instance.status === 'APPROVED' || instance.status === 'ARCHIVED')
            nextStatus = 'APPROVED';
        else if (instance.status === 'REJECTED')
            nextStatus = 'REJECTED';
        else if (instance.status === 'WITHDRAWN')
            nextStatus = 'DRAFT';
        if (!nextStatus)
            return request;
        const updated = await this.prisma.leaveRequest.update({
            where: { id: request.id },
            data: { status: nextStatus, version: { increment: 1 } },
            include: includeRequest,
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'LeaveRequest',
            entityId: request.id,
            beforeData: request,
            afterData: updated,
            remark: `PENDING_APPROVAL -> ${nextStatus}（同步自 WorkflowInstance ${instance.id}）`,
            ...this.auditCtx(request.storeId),
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
exports.LeaveRequestService = LeaveRequestService;
exports.LeaveRequestService = LeaveRequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_engine_service_1.WorkflowEngineService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], LeaveRequestService);
//# sourceMappingURL=leave-request.service.js.map