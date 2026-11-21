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
exports.CareOutreachPlanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const data_scope_service_1 = require("../../common/scope/data-scope.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const date_util_1 = require("../../common/utils/date.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const includePlan = {
    tasks: { orderBy: { dayOffset: 'asc' } },
};
let CareOutreachPlanService = class CareOutreachPlanService {
    prisma;
    auditLogService;
    ctx;
    dataScopeService;
    constructor(prisma, auditLogService, ctx, dataScopeService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
        this.dataScopeService = dataScopeService;
    }
    findMany(query = {}) {
        return this.prisma.careOutreachPlan.findMany({
            where: { tenantId: this.ctx.tenantId, motherProfileId: query.motherProfileId },
            include: includePlan,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const plan = await this.prisma.careOutreachPlan.findUnique({ where: { id, tenantId: this.ctx.tenantId }, include: includePlan });
        if (!plan)
            throw new common_1.NotFoundException(`CareOutreachPlan ${id} 不存在`);
        return plan;
    }
    async findPendingTasks() {
        const allowed = await this.dataScopeService.resolveAllowedStoreIds(this.ctx);
        return this.prisma.careOutreachTask.findMany({
            where: { tenantId: this.ctx.tenantId, status: 'PENDING', storeId: allowed === 'ALL' ? undefined : { in: allowed } },
            include: { plan: { include: { motherProfile: { include: { customer: true } } } } },
            orderBy: { scheduledDate: 'asc' },
        });
    }
    async create(dto) {
        const template = await this.prisma.careOutreachTemplate.findUnique({ where: { id: dto.templateId }, include: { items: true } });
        if (!template)
            throw new common_1.NotFoundException(`CareOutreachTemplate ${dto.templateId} 不存在`);
        const mother = await this.prisma.motherProfile.findUnique({ where: { id: dto.motherProfileId } });
        if (!mother)
            throw new common_1.NotFoundException(`MotherProfile ${dto.motherProfileId} 不存在`);
        const checkedOutAt = new Date(dto.checkedOutAt);
        const created = await this.prisma.$transaction(async (tx) => {
            const plan = await tx.careOutreachPlan.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId: mother.storeId,
                    planNo: (0, business_no_util_1.generateBusinessNo)('CO'),
                    templateId: dto.templateId,
                    motherProfileId: dto.motherProfileId,
                    checkedOutAt,
                    status: 'ACTIVE',
                    createdBy: this.ctx.accountId,
                },
            });
            await tx.careOutreachTask.createMany({
                data: template.items.map((item) => ({
                    tenantId: this.ctx.tenantId,
                    storeId: mother.storeId,
                    planId: plan.id,
                    dayOffset: item.dayOffset,
                    scheduledDate: (0, date_util_1.addDays)(checkedOutAt, item.dayOffset),
                    title: item.title,
                    content: item.content,
                })),
            });
            return plan;
        });
        const withTasks = await this.findOneOrThrow(created.id);
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CareOutreachPlan',
            entityId: created.id,
            afterData: withTasks,
            ...this.auditCtx(),
        });
        return withTasks;
    }
    async terminate(id, reason, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        await this.dataScopeService.assertStoreAccessible(this.ctx, before.storeId);
        if (before.version !== expectedVersion) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        if (before.status !== 'ACTIVE') {
            throw new common_1.BadRequestException(`关怀计划当前状态「${before.status}」不允许终止`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.$transaction(async (tx) => {
            const plan = await tx.careOutreachPlan.update({
                where: { id, version: expectedVersion },
                data: { status: 'TERMINATED', terminateReason: reason, version: { increment: 1 } },
            });
            await tx.careOutreachTask.updateMany({
                where: { planId: id, status: 'PENDING' },
                data: { status: 'SKIPPED', completionNote: `计划已终止：${reason}` },
            });
            return plan;
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'CareOutreachPlan',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `ACTIVE -> TERMINATED：${reason}`,
            ...this.auditCtx(),
        });
        return this.findOneOrThrow(id);
    }
    async completeTask(taskId, dto) {
        const task = await this.prisma.careOutreachTask.findFirst({ where: { id: taskId, tenantId: this.ctx.tenantId } });
        if (!task)
            throw new common_1.NotFoundException(`CareOutreachTask ${taskId} 不存在`);
        await this.dataScopeService.assertStoreAccessible(this.ctx, task.storeId);
        if (task.status !== 'PENDING') {
            throw new common_1.BadRequestException(`该关怀任务当前状态「${task.status}」不允许处理`);
        }
        const updatedTask = await this.prisma.careOutreachTask.update({
            where: { id: taskId },
            data: {
                status: dto.status,
                completionNote: dto.completionNote,
                completedById: this.ctx.accountId,
                completedAt: new Date(),
            },
        });
        const remainingPending = await this.prisma.careOutreachTask.count({ where: { planId: task.planId, status: 'PENDING' } });
        if (remainingPending === 0) {
            await this.prisma.careOutreachPlan.update({ where: { id: task.planId }, data: { status: 'COMPLETED' } });
        }
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'CareOutreachTask',
            entityId: taskId,
            beforeData: task,
            afterData: updatedTask,
            changedFields: ['status', 'completionNote'],
            ...this.auditCtx(),
        });
        return updatedTask;
    }
    auditCtx() {
        return {
            tenantId: this.ctx.tenantId,
            storeId: this.ctx.homeStoreId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        };
    }
};
exports.CareOutreachPlanService = CareOutreachPlanService;
exports.CareOutreachPlanService = CareOutreachPlanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService,
        data_scope_service_1.DataScopeService])
], CareOutreachPlanService);
//# sourceMappingURL=care-outreach-plan.service.js.map