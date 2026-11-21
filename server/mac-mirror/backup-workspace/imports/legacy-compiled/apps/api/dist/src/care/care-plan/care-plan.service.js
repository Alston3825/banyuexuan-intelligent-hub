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
exports.CarePlanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const date_util_1 = require("../../common/utils/date.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const includePlan = {
    tasks: { include: { formTemplate: true }, orderBy: { dayOffset: 'asc' } },
};
let CarePlanService = class CarePlanService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.carePlan.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                motherProfileId: query.motherProfileId,
                babyProfileId: query.babyProfileId,
                status: query.status,
            },
            include: includePlan,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const plan = await this.prisma.carePlan.findUnique({ where: { id }, include: includePlan });
        if (!plan)
            throw new common_1.NotFoundException(`CarePlan ${id} 不存在`);
        return plan;
    }
    async create(dto) {
        if (!!dto.motherProfileId === !!dto.babyProfileId) {
            throw new common_1.BadRequestException('motherProfileId 与 babyProfileId 必须二选一');
        }
        const template = await this.prisma.carePlanTemplate.findUnique({
            where: { id: dto.planTemplateId },
            include: { items: true },
        });
        if (!template)
            throw new common_1.NotFoundException(`CarePlanTemplate ${dto.planTemplateId} 不存在`);
        let storeId;
        if (dto.motherProfileId) {
            if (template.targetType !== 'MOTHER')
                throw new common_1.BadRequestException('护理方案的适用对象与妈妈档案不一致');
            const mother = await this.prisma.motherProfile.findUnique({ where: { id: dto.motherProfileId } });
            if (!mother)
                throw new common_1.NotFoundException(`MotherProfile ${dto.motherProfileId} 不存在`);
            storeId = mother.storeId;
        }
        else {
            if (template.targetType !== 'BABY')
                throw new common_1.BadRequestException('护理方案的适用对象与宝宝档案不一致');
            const baby = await this.prisma.babyProfile.findUnique({ where: { id: dto.babyProfileId } });
            if (!baby)
                throw new common_1.NotFoundException(`BabyProfile ${dto.babyProfileId} 不存在`);
            storeId = baby.storeId;
        }
        const startDate = new Date(dto.startDate);
        const created = await this.prisma.$transaction(async (tx) => {
            const plan = await tx.carePlan.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId,
                    planNo: (0, business_no_util_1.generateBusinessNo)('CP'),
                    planTemplateId: dto.planTemplateId,
                    motherProfileId: dto.motherProfileId,
                    babyProfileId: dto.babyProfileId,
                    startDate,
                    status: 'ACTIVE',
                    createdBy: this.ctx.accountId,
                },
            });
            await tx.carePlanTask.createMany({
                data: template.items.map((item) => ({
                    carePlanId: plan.id,
                    dayOffset: item.dayOffset,
                    scheduledDate: (0, date_util_1.addDays)(startDate, item.dayOffset - 1),
                    formTemplateId: item.formTemplateId,
                })),
            });
            return plan;
        });
        const withTasks = await this.findOneOrThrow(created.id);
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CarePlan',
            entityId: created.id,
            afterData: withTasks,
            ...this.auditCtx(),
        });
        return withTasks;
    }
    async terminate(id, reason, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== expectedVersion) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        if (before.status !== 'ACTIVE') {
            throw new common_1.BadRequestException(`护理计划当前状态「${before.status}」不允许终止`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.$transaction(async (tx) => {
            const plan = await tx.carePlan.update({
                where: { id, version: expectedVersion },
                data: { status: 'TERMINATED', terminateReason: reason, version: { increment: 1 } },
            });
            await tx.carePlanTask.updateMany({
                where: { carePlanId: id, status: 'PENDING' },
                data: { status: 'MISSED' },
            });
            return plan;
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'CarePlan',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `ACTIVE -> TERMINATED：${reason}`,
            ...this.auditCtx(),
        });
        return this.findOneOrThrow(id);
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
exports.CarePlanService = CarePlanService;
exports.CarePlanService = CarePlanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CarePlanService);
//# sourceMappingURL=care-plan.service.js.map