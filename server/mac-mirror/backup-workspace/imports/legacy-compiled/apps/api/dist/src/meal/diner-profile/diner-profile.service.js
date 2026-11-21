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
exports.DinerProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const date_util_1 = require("../../common/utils/date.util");
const includeProfile = {
    mealPlanTemplate: true,
    restrictions: { include: { restriction: true } },
};
let DinerProfileService = class DinerProfileService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.dinerProfile.findMany({
            where: { tenantId: this.ctx.tenantId, customerId: query.customerId },
            include: includeProfile,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const profile = await this.prisma.dinerProfile.findUnique({ where: { id }, include: includeProfile });
        if (!profile)
            throw new common_1.NotFoundException(`DinerProfile ${id} 不存在`);
        return profile;
    }
    async create(dto) {
        const [customer, template] = await Promise.all([
            this.prisma.customer.findUnique({ where: { id: dto.customerId } }),
            this.prisma.mealPlanTemplate.findUnique({ where: { id: dto.mealPlanTemplateId }, include: { items: true } }),
        ]);
        if (!customer)
            throw new common_1.NotFoundException(`Customer ${dto.customerId} 不存在`);
        if (!template)
            throw new common_1.NotFoundException(`MealPlanTemplate ${dto.mealPlanTemplateId} 不存在`);
        if (template.items.length === 0)
            throw new common_1.BadRequestException('该膳食计划模板尚未配置排期，无法生成用膳人');
        if (dto.restrictionIds?.length) {
            const restrictions = await this.prisma.dietaryRestriction.findMany({ where: { id: { in: dto.restrictionIds } } });
            if (restrictions.length !== dto.restrictionIds.length)
                throw new common_1.BadRequestException('存在不存在的禁忌 ID');
        }
        const storeId = dto.occupancyId
            ? (await this.prisma.roomOccupancy.findUnique({ where: { id: dto.occupancyId } }))?.storeId
            : this.ctx.homeStoreId;
        if (!storeId)
            throw new common_1.BadRequestException('无法确定门店，请传入 occupancyId 或确保当前账号绑定门店');
        const startDate = new Date(dto.startDate);
        const endDate = (0, date_util_1.addDays)(startDate, template.totalDays - 1);
        const created = await this.prisma.$transaction(async (tx) => {
            const profile = await tx.dinerProfile.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId,
                    customerId: dto.customerId,
                    mealPlanTemplateId: dto.mealPlanTemplateId,
                    occupancyId: dto.occupancyId,
                    startDate,
                    endDate,
                    createdBy: this.ctx.accountId,
                },
            });
            if (dto.restrictionIds?.length) {
                await tx.dinerRestriction.createMany({
                    data: dto.restrictionIds.map((restrictionId) => ({ dinerProfileId: profile.id, restrictionId })),
                });
            }
            await tx.mealRecord.createMany({
                data: template.items.map((item) => ({
                    tenantId: this.ctx.tenantId,
                    storeId,
                    dinerProfileId: profile.id,
                    scheduledDate: (0, date_util_1.addDays)(startDate, item.dayOffset - 1),
                    slot: item.slot,
                    defaultMealItemId: item.mealItemId,
                })),
            });
            return profile;
        });
        const withIncludes = await this.findOneOrThrow(created.id);
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'DinerProfile',
            entityId: created.id,
            afterData: withIncludes,
            ...this.auditCtx(storeId),
        });
        return withIncludes;
    }
    async end(id) {
        const before = await this.findOneOrThrow(id);
        if (before.status !== 'ACTIVE')
            throw new common_1.BadRequestException(`用膳人当前状态「${before.status}」不允许结束`);
        const updated = await this.prisma.dinerProfile.update({
            where: { id },
            data: { status: 'ENDED', version: { increment: 1 } },
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'DinerProfile',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'ACTIVE -> ENDED',
            ...this.auditCtx(before.storeId),
        });
        return updated;
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
exports.DinerProfileService = DinerProfileService;
exports.DinerProfileService = DinerProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], DinerProfileService);
//# sourceMappingURL=diner-profile.service.js.map