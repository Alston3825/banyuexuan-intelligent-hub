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
exports.PayrollRecordService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const workflow_engine_service_1 = require("../../workflow/workflow-engine/workflow-engine.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const DEFINITION_CODE = 'HR_PAYROLL';
const BUSINESS_TYPE = 'PAYROLL_RECORD';
const includeRecord = { employeeProfile: { include: { account: { select: { id: true, realName: true } } } } };
const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;
function parsePeriodRange(period) {
    const [year, month] = period.split('-').map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1) - BEIJING_OFFSET_MS);
    const end = new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1) - BEIJING_OFFSET_MS);
    return { start, end };
}
let PayrollRecordService = class PayrollRecordService {
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
    async scopeFilter() {
        if (await this.ctx.hasPermission('hr.payroll-record.view-all'))
            return null;
        const me = await this.prisma.account.findUnique({ where: { id: this.ctx.accountId }, select: { departmentId: true } });
        const grants = await this.ctx.getScopeGrants();
        let frontier = [...new Set([me?.departmentId, ...grants.filter((g) => g.scopeType === 'DEPARTMENT').map((g) => g.scopeId)].filter((x) => !!x))];
        const all = new Set(frontier);
        while (frontier.length > 0) {
            const children = await this.prisma.department.findMany({ where: { parentId: { in: frontier } }, select: { id: true } });
            frontier = children.map((c) => c.id).filter((id) => !all.has(id));
            frontier.forEach((id) => all.add(id));
        }
        return {
            OR: [
                ...(all.size > 0 ? [{ employeeProfile: { account: { departmentId: { in: [...all] } } } }] : []),
                { employeeProfile: { accountId: this.ctx.accountId } },
            ],
        };
    }
    async findMany(query = {}) {
        const scope = await this.scopeFilter();
        const records = await this.prisma.payrollRecord.findMany({
            where: { tenantId: this.ctx.tenantId, storeId: query.storeId, employeeProfileId: query.employeeProfileId, period: query.period, status: query.status, ...(scope ? { AND: [scope] } : {}) },
            include: includeRecord,
            orderBy: { createdAt: 'desc' },
        });
        return Promise.all(records.map((r) => this.reconcileStatus(r)));
    }
    async findOneOrThrow(id) {
        const scope = await this.scopeFilter();
        const record = await this.prisma.payrollRecord.findFirst({ where: { id, ...(scope ? { AND: [scope] } : {}) }, include: includeRecord });
        if (!record)
            throw new common_1.NotFoundException(`PayrollRecord ${id} 不存在`);
        return this.reconcileStatus(record);
    }
    async create(dto) {
        const employeeProfile = await this.prisma.employeeProfile.findUnique({ where: { id: dto.employeeProfileId } });
        if (!employeeProfile)
            throw new common_1.NotFoundException(`EmployeeProfile ${dto.employeeProfileId} 不存在`);
        const existing = await this.prisma.payrollRecord.findUnique({
            where: { tenantId_employeeProfileId_period: { tenantId: this.ctx.tenantId, employeeProfileId: dto.employeeProfileId, period: dto.period } },
        });
        if (existing)
            throw new common_1.BadRequestException(`该员工 ${dto.period} 期的薪资单已存在`);
        const { start, end } = parsePeriodRange(dto.period);
        const approvedAllocations = await this.prisma.commissionAllocation.findMany({
            where: {
                employeeProfileId: dto.employeeProfileId,
                commissionRecord: { status: 'APPROVED', createdAt: { gte: start, lt: end } },
            },
        });
        const commissionTotal = approvedAllocations.reduce((sum, a) => sum + a.amount, 0);
        const deductions = dto.deductions ?? 0;
        const netAmount = dto.baseSalary + commissionTotal - deductions;
        const created = await this.prisma.payrollRecord.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: dto.storeId,
                employeeProfileId: dto.employeeProfileId,
                period: dto.period,
                baseSalary: dto.baseSalary,
                commissionTotal,
                deductions,
                netAmount,
                remark: dto.remark,
                createdBy: this.ctx.accountId,
            },
            include: includeRecord,
        });
        await this.auditLogService.record({ action: 'CREATE', entityType: 'PayrollRecord', entityId: created.id, afterData: created, ...this.auditCtx(dto.storeId) });
        return created;
    }
    async submit(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'DRAFT')
            throw new common_1.BadRequestException(`薪资单当前状态「${before.status}」不允许提交`);
        await this.workflowEngineService.startInstance({ definitionCode: DEFINITION_CODE, businessType: BUSINESS_TYPE, businessId: id, title: `薪资单-${before.period}`, storeId: before.storeId }, this.actor());
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.payrollRecord.update({
            where: { id, version: expectedVersion },
            data: { status: 'PENDING_APPROVAL', version: { increment: 1 } },
            include: includeRecord,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'PayrollRecord',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'DRAFT -> PENDING_APPROVAL',
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async markPaid(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'APPROVED')
            throw new common_1.BadRequestException(`薪资单当前状态「${before.status}」不允许标记发放`);
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.payrollRecord.update({
            where: { id, version: expectedVersion },
            data: { status: 'PAID', paidAt: new Date(), version: { increment: 1 } },
            include: includeRecord,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'PayrollRecord',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'APPROVED -> PAID',
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async cancel(id, cancelReason, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (!['DRAFT', 'PENDING_APPROVAL', 'APPROVED'].includes(before.status)) {
            throw new common_1.BadRequestException(`薪资单当前状态「${before.status}」不允许取消`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.payrollRecord.update({
            where: { id, version: expectedVersion },
            data: { status: 'CANCELLED', cancelReason, version: { increment: 1 } },
            include: includeRecord,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'PayrollRecord',
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
        const updated = await this.prisma.payrollRecord.update({
            where: { id: record.id },
            data: { status: nextStatus, version: { increment: 1 } },
            include: includeRecord,
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'PayrollRecord',
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
exports.PayrollRecordService = PayrollRecordService;
exports.PayrollRecordService = PayrollRecordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_engine_service_1.WorkflowEngineService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], PayrollRecordService);
//# sourceMappingURL=payroll-record.service.js.map