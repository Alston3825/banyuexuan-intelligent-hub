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
exports.TagService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const base_scoped_crud_service_1 = require("../../common/base/base-scoped-crud.service");
let TagService = class TagService extends base_scoped_crud_service_1.BaseScopedCrudService {
    prisma;
    entityType = 'Tag';
    constructor(prisma, auditLogService, ctx) {
        super(auditLogService, ctx);
        this.prisma = prisma;
    }
    get delegate() {
        return this.prisma.tag;
    }
    create(data) {
        return super.create({ ...data, tenantId: this.ctx.tenantId });
    }
    async bind(tagId, entityType, entityId) {
        await this.findOneOrThrow(tagId);
        const binding = await this.prisma.tagBinding.create({
            data: { tagId, entityType, entityId, tenantId: this.ctx.tenantId, createdBy: this.ctx.accountId },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'TagBinding',
            entityId: binding.id,
            afterData: binding,
            ...this.bindingAuditCtx(),
        });
        return binding;
    }
    async unbind(bindingId) {
        const binding = await this.prisma.tagBinding.update({
            where: { id: bindingId },
            data: { revokedAt: new Date() },
        });
        await this.auditLogService.record({
            action: 'DELETE',
            entityType: 'TagBinding',
            entityId: bindingId,
            afterData: binding,
            ...this.bindingAuditCtx(),
        });
        return binding;
    }
    listByCategory(category) {
        return this.prisma.tag.findMany({ where: { category }, orderBy: { createdAt: 'asc' } });
    }
    listActiveBindings(entityType, entityId) {
        return this.prisma.tagBinding.findMany({
            where: { entityType, entityId, revokedAt: null },
            include: { tag: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    listBindingHistory(entityType, entityId, category) {
        return this.prisma.tagBinding.findMany({
            where: { entityType, entityId, ...(category ? { tag: { category } } : {}) },
            include: { tag: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async setExclusiveTag(entityType, entityId, category, newTagId) {
        const newTag = await this.findOneOrThrow(newTagId);
        if (newTag.category !== category) {
            throw new common_1.NotFoundException(`标签 ${newTagId} 不属于分类 ${category}`);
        }
        return this.prisma.$transaction(async (tx) => {
            const currentActive = await tx.tagBinding.findMany({
                where: { entityType, entityId, revokedAt: null, tag: { category } },
            });
            const now = new Date();
            for (const b of currentActive) {
                if (b.tagId === newTagId)
                    continue;
                await tx.tagBinding.update({ where: { id: b.id }, data: { revokedAt: now } });
            }
            const alreadyActive = currentActive.some((b) => b.tagId === newTagId);
            if (alreadyActive)
                return tx.tagBinding.findFirst({ where: { entityType, entityId, tagId: newTagId, revokedAt: null }, include: { tag: true } });
            const created = await tx.tagBinding.create({
                data: { tagId: newTagId, entityType, entityId, tenantId: this.ctx.tenantId, createdBy: this.ctx.accountId },
                include: { tag: true },
            });
            await this.auditLogService.record({
                action: 'CREATE',
                entityType: 'TagBinding',
                entityId: created.id,
                afterData: created,
                remark: `分类"${category}"标签变更为"${newTag.name}"`,
                ...this.bindingAuditCtx(),
            });
            return created;
        });
    }
    bindingAuditCtx() {
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
exports.TagService = TagService;
exports.TagService = TagService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], TagService);
//# sourceMappingURL=tag.service.js.map