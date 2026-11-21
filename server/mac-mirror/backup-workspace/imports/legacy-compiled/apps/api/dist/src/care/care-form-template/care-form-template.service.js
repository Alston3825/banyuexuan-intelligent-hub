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
exports.CareFormTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const includeFields = {
    fields: { include: { field: true }, orderBy: { sortOrder: 'asc' } },
};
let CareFormTemplateService = class CareFormTemplateService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.careFormTemplate.findMany({
            where: { tenantId: this.ctx.tenantId, targetType: query.targetType, department: query.department },
            include: includeFields,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const template = await this.prisma.careFormTemplate.findUnique({ where: { id }, include: includeFields });
        if (!template)
            throw new common_1.NotFoundException(`CareFormTemplate ${id} 不存在`);
        return template;
    }
    async assertFieldsMatchTarget(fieldIds, targetType) {
        const fields = await this.prisma.careFieldDefinition.findMany({ where: { id: { in: fieldIds } } });
        if (fields.length !== new Set(fieldIds).size) {
            throw new common_1.BadRequestException('存在不存在的护理字段 ID');
        }
        const mismatched = fields.find((f) => f.targetType !== targetType);
        if (mismatched) {
            throw new common_1.BadRequestException(`字段「${mismatched.name}」的适用对象与表单不一致`);
        }
    }
    async create(dto) {
        await this.assertFieldsMatchTarget(dto.fields.map((f) => f.fieldId), dto.targetType);
        const created = await this.prisma.$transaction(async (tx) => {
            const template = await tx.careFormTemplate.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    code: dto.code,
                    name: dto.name,
                    targetType: dto.targetType,
                    department: dto.department,
                    scene: dto.scene,
                    createdBy: this.ctx.accountId,
                },
            });
            await tx.careFormTemplateField.createMany({
                data: dto.fields.map((f) => ({
                    formTemplateId: template.id,
                    fieldId: f.fieldId,
                    required: f.required ?? false,
                    sortOrder: f.sortOrder ?? 0,
                })),
            });
            return template;
        });
        const withFields = await this.findOneOrThrow(created.id);
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CareFormTemplate',
            entityId: created.id,
            afterData: withFields,
            ...this.auditCtx(),
        });
        return withFields;
    }
    async update(id, dto) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== dto.version) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        if (dto.fields) {
            await this.assertFieldsMatchTarget(dto.fields.map((f) => f.fieldId), before.targetType);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.$transaction(async (tx) => {
            const template = await tx.careFormTemplate.update({
                where: { id, version: dto.version },
                data: {
                    name: dto.name,
                    scene: dto.scene,
                    status: dto.status,
                    version: { increment: 1 },
                },
            });
            if (dto.fields) {
                await tx.careFormTemplateField.deleteMany({ where: { formTemplateId: id } });
                await tx.careFormTemplateField.createMany({
                    data: dto.fields.map((f) => ({
                        formTemplateId: id,
                        fieldId: f.fieldId,
                        required: f.required ?? false,
                        sortOrder: f.sortOrder ?? 0,
                    })),
                });
            }
            return template;
        }));
        const withFields = await this.findOneOrThrow(updated.id);
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'CareFormTemplate',
            entityId: id,
            beforeData: before,
            afterData: withFields,
            changedFields: Object.keys(dto).filter((k) => k !== 'version'),
            ...this.auditCtx(),
        });
        return withFields;
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
exports.CareFormTemplateService = CareFormTemplateService;
exports.CareFormTemplateService = CareFormTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CareFormTemplateService);
//# sourceMappingURL=care-form-template.service.js.map