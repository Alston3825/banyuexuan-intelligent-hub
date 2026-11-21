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
exports.CarePlanTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const includeItems = {
    items: { include: { formTemplate: true }, orderBy: { dayOffset: 'asc' } },
};
let CarePlanTemplateService = class CarePlanTemplateService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.carePlanTemplate.findMany({
            where: { tenantId: this.ctx.tenantId, targetType: query.targetType },
            include: includeItems,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const template = await this.prisma.carePlanTemplate.findUnique({ where: { id }, include: includeItems });
        if (!template)
            throw new common_1.NotFoundException(`CarePlanTemplate ${id} 不存在`);
        return template;
    }
    async assertItemsValid(items, targetType, totalDays) {
        const overLimit = items.find((i) => i.dayOffset > totalDays);
        if (overLimit) {
            throw new common_1.BadRequestException(`排期第 ${overLimit.dayOffset} 天超出方案总天数 ${totalDays} 天`);
        }
        const formTemplateIds = [...new Set(items.map((i) => i.formTemplateId))];
        const templates = await this.prisma.careFormTemplate.findMany({ where: { id: { in: formTemplateIds } } });
        if (templates.length !== formTemplateIds.length) {
            throw new common_1.BadRequestException('存在不存在的护理项目（表单模板）ID');
        }
        const mismatched = templates.find((t) => t.targetType !== targetType);
        if (mismatched) {
            throw new common_1.BadRequestException(`护理项目「${mismatched.name}」的适用对象与方案不一致`);
        }
    }
    async create(dto) {
        await this.assertItemsValid(dto.items, dto.targetType, dto.totalDays);
        const created = await this.prisma.$transaction(async (tx) => {
            const template = await tx.carePlanTemplate.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    code: dto.code,
                    name: dto.name,
                    targetType: dto.targetType,
                    totalDays: dto.totalDays,
                    createdBy: this.ctx.accountId,
                },
            });
            await tx.carePlanTemplateItem.createMany({
                data: dto.items.map((i) => ({
                    planTemplateId: template.id,
                    dayOffset: i.dayOffset,
                    formTemplateId: i.formTemplateId,
                })),
            });
            return template;
        });
        const withItems = await this.findOneOrThrow(created.id);
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CarePlanTemplate',
            entityId: created.id,
            afterData: withItems,
            ...this.auditCtx(),
        });
        return withItems;
    }
    async update(id, dto) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== dto.version) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        if (dto.items) {
            await this.assertItemsValid(dto.items, before.targetType, before.totalDays);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.$transaction(async (tx) => {
            const template = await tx.carePlanTemplate.update({
                where: { id, version: dto.version },
                data: {
                    name: dto.name,
                    status: dto.status,
                    version: { increment: 1 },
                },
            });
            if (dto.items) {
                await tx.carePlanTemplateItem.deleteMany({ where: { planTemplateId: id } });
                await tx.carePlanTemplateItem.createMany({
                    data: dto.items.map((i) => ({
                        planTemplateId: id,
                        dayOffset: i.dayOffset,
                        formTemplateId: i.formTemplateId,
                    })),
                });
            }
            return template;
        }));
        const withItems = await this.findOneOrThrow(updated.id);
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'CarePlanTemplate',
            entityId: id,
            beforeData: before,
            afterData: withItems,
            changedFields: Object.keys(dto).filter((k) => k !== 'version'),
            ...this.auditCtx(),
        });
        return withItems;
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
exports.CarePlanTemplateService = CarePlanTemplateService;
exports.CarePlanTemplateService = CarePlanTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CarePlanTemplateService);
//# sourceMappingURL=care-plan-template.service.js.map