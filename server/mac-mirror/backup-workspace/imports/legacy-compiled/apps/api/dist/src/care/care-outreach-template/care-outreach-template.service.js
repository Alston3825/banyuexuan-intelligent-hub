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
exports.CareOutreachTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const includeItems = {
    items: { orderBy: { dayOffset: 'asc' } },
};
let CareOutreachTemplateService = class CareOutreachTemplateService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany() {
        return this.prisma.careOutreachTemplate.findMany({
            where: { tenantId: this.ctx.tenantId },
            include: includeItems,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const template = await this.prisma.careOutreachTemplate.findUnique({ where: { id }, include: includeItems });
        if (!template)
            throw new common_1.NotFoundException(`CareOutreachTemplate ${id} 不存在`);
        return template;
    }
    async create(dto) {
        const created = await this.prisma.$transaction(async (tx) => {
            const template = await tx.careOutreachTemplate.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    code: dto.code,
                    name: dto.name,
                    createdBy: this.ctx.accountId,
                },
            });
            await tx.careOutreachTemplateItem.createMany({
                data: dto.items.map((item) => ({
                    templateId: template.id,
                    dayOffset: item.dayOffset,
                    title: item.title,
                    content: item.content,
                })),
            });
            return template;
        });
        const withItems = await this.findOneOrThrow(created.id);
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CareOutreachTemplate',
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
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.$transaction(async (tx) => {
            const template = await tx.careOutreachTemplate.update({
                where: { id, version: dto.version },
                data: { name: dto.name, status: dto.status, version: { increment: 1 } },
            });
            if (dto.items) {
                await tx.careOutreachTemplateItem.deleteMany({ where: { templateId: id } });
                await tx.careOutreachTemplateItem.createMany({
                    data: dto.items.map((item) => ({
                        templateId: id,
                        dayOffset: item.dayOffset,
                        title: item.title,
                        content: item.content,
                    })),
                });
            }
            return template;
        }));
        const withItems = await this.findOneOrThrow(updated.id);
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'CareOutreachTemplate',
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
exports.CareOutreachTemplateService = CareOutreachTemplateService;
exports.CareOutreachTemplateService = CareOutreachTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CareOutreachTemplateService);
//# sourceMappingURL=care-outreach-template.service.js.map