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
exports.CareRecordService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const includeRecord = {
    formTemplate: true,
    corrections: true,
    abnormalities: true,
};
let CareRecordService = class CareRecordService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.careRecord.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                motherProfileId: query.motherProfileId,
                babyProfileId: query.babyProfileId,
                formTemplateId: query.formTemplateId,
            },
            include: includeRecord,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const record = await this.prisma.careRecord.findUnique({ where: { id }, include: includeRecord });
        if (!record)
            throw new common_1.NotFoundException(`CareRecord ${id} 不存在`);
        return record;
    }
    validateValuesAgainstTemplate(values, fields) {
        const byCode = new Map(fields.map((f) => [f.field.code, f]));
        for (const code of Object.keys(values)) {
            if (!byCode.has(code)) {
                throw new common_1.BadRequestException(`字段「${code}」不属于该表单模板`);
            }
        }
        for (const { required, field } of fields) {
            const value = values[field.code];
            if (required && (value === undefined || value === null || value === '')) {
                throw new common_1.BadRequestException(`字段「${field.name}」为必填项`);
            }
            if (value === undefined || value === null || value === '')
                continue;
            if (field.controlType === 'NUMBER' && typeof value !== 'number') {
                throw new common_1.BadRequestException(`字段「${field.name}」应为数值`);
            }
            if ((field.controlType === 'SELECT' || field.controlType === 'RADIO') && field.options) {
                const optionValues = field.options.map((o) => o.value);
                if (!optionValues.includes(String(value))) {
                    throw new common_1.BadRequestException(`字段「${field.name}」的值不在候选项范围内`);
                }
            }
        }
    }
    detectAbnormalFields(values, fields) {
        const abnormal = [];
        for (const { field } of fields) {
            const value = values[field.code];
            if (value === undefined || value === null || value === '')
                continue;
            if (field.controlType === 'NUMBER' && typeof value === 'number') {
                if ((field.normalMin !== null && value < field.normalMin) || (field.normalMax !== null && value > field.normalMax)) {
                    abnormal.push(field);
                }
            }
            else if (field.normalOptionValues) {
                const normalValues = field.normalOptionValues;
                if (!normalValues.includes(String(value))) {
                    abnormal.push(field);
                }
            }
        }
        return abnormal;
    }
    async create(dto) {
        if (!!dto.motherProfileId === !!dto.babyProfileId) {
            throw new common_1.BadRequestException('motherProfileId 与 babyProfileId 必须二选一');
        }
        if (dto.isBackfilled && !dto.backfillReason) {
            throw new common_1.BadRequestException('补录记录必须填写补录原因');
        }
        const template = await this.prisma.careFormTemplate.findUnique({
            where: { id: dto.formTemplateId },
            include: { fields: { include: { field: true } } },
        });
        if (!template)
            throw new common_1.NotFoundException(`CareFormTemplate ${dto.formTemplateId} 不存在`);
        let storeId;
        if (dto.motherProfileId) {
            if (template.targetType !== 'MOTHER')
                throw new common_1.BadRequestException('表单模板的适用对象与妈妈档案不一致');
            const mother = await this.prisma.motherProfile.findUnique({ where: { id: dto.motherProfileId } });
            if (!mother)
                throw new common_1.NotFoundException(`MotherProfile ${dto.motherProfileId} 不存在`);
            storeId = mother.storeId;
        }
        else {
            if (template.targetType !== 'BABY')
                throw new common_1.BadRequestException('表单模板的适用对象与宝宝档案不一致');
            const baby = await this.prisma.babyProfile.findUnique({ where: { id: dto.babyProfileId } });
            if (!baby)
                throw new common_1.NotFoundException(`BabyProfile ${dto.babyProfileId} 不存在`);
            storeId = baby.storeId;
        }
        this.validateValuesAgainstTemplate(dto.values, template.fields);
        let originalRecord = null;
        if (dto.correctionOfId) {
            originalRecord = await this.prisma.careRecord.findUnique({ where: { id: dto.correctionOfId } });
            if (!originalRecord)
                throw new common_1.NotFoundException(`CareRecord ${dto.correctionOfId} 不存在`);
            if (originalRecord.formTemplateId !== dto.formTemplateId) {
                throw new common_1.BadRequestException('更正记录的表单模板必须与被更正记录一致');
            }
            if ((dto.motherProfileId && originalRecord.motherProfileId !== dto.motherProfileId) ||
                (dto.babyProfileId && originalRecord.babyProfileId !== dto.babyProfileId)) {
                throw new common_1.BadRequestException('更正记录的档案必须与被更正记录一致');
            }
        }
        let task = null;
        if (dto.carePlanTaskId) {
            task = await this.prisma.carePlanTask.findUnique({ where: { id: dto.carePlanTaskId } });
            if (!task)
                throw new common_1.NotFoundException(`CarePlanTask ${dto.carePlanTaskId} 不存在`);
            if (task.formTemplateId !== dto.formTemplateId) {
                throw new common_1.BadRequestException('任务卡片对应的表单模板与提交的表单不一致');
            }
            if (task.status !== 'PENDING') {
                throw new common_1.BadRequestException(`任务卡片当前状态「${task.status}」不允许提交（如需更正已完成记录，请使用更正接口）`);
            }
        }
        const abnormalFields = this.detectAbnormalFields(dto.values, template.fields);
        const created = await this.prisma.$transaction(async (tx) => {
            const record = await tx.careRecord.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId,
                    recordNo: (0, business_no_util_1.generateBusinessNo)('CR'),
                    formTemplateId: dto.formTemplateId,
                    targetType: template.targetType,
                    motherProfileId: dto.motherProfileId,
                    babyProfileId: dto.babyProfileId,
                    occurredAt: new Date(dto.occurredAt),
                    values: dto.values,
                    isBackfilled: dto.isBackfilled ?? false,
                    backfillReason: dto.backfillReason,
                    correctionOfId: dto.correctionOfId,
                    submittedBy: this.ctx.accountId,
                },
            });
            if (task) {
                await tx.carePlanTask.update({
                    where: { id: task.id },
                    data: { status: 'COMPLETED', careRecordId: record.id },
                });
            }
            const abnormalities = [];
            for (const field of abnormalFields) {
                const abnormality = await tx.careAbnormality.create({
                    data: {
                        tenantId: this.ctx.tenantId,
                        storeId,
                        careRecordId: record.id,
                        fieldId: field.id,
                        targetType: template.targetType,
                        motherProfileId: dto.motherProfileId,
                        babyProfileId: dto.babyProfileId,
                        occurredAt: new Date(dto.occurredAt),
                        fieldValue: dto.values[field.code],
                        createdBy: this.ctx.accountId,
                    },
                });
                abnormalities.push(abnormality);
            }
            return { record, abnormalities };
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CareRecord',
            entityId: created.record.id,
            afterData: created,
            remark: dto.correctionOfId
                ? `更正记录，原记录 ${dto.correctionOfId}`
                : dto.isBackfilled
                    ? `补录：${dto.backfillReason}`
                    : undefined,
            ...this.auditCtx(),
        });
        for (const abnormality of created.abnormalities) {
            await this.auditLogService.record({
                action: 'CREATE',
                entityType: 'CareAbnormality',
                entityId: abnormality.id,
                afterData: abnormality,
                remark: '由护理记录自动触发',
                ...this.auditCtx(),
            });
        }
        const withIncludes = await this.findOneOrThrow(created.record.id);
        return { record: withIncludes, abnormalities: created.abnormalities };
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
exports.CareRecordService = CareRecordService;
exports.CareRecordService = CareRecordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CareRecordService);
//# sourceMappingURL=care-record.service.js.map