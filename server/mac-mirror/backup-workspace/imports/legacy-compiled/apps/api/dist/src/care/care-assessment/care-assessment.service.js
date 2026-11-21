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
var CareAssessmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareAssessmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const assessment_codec_1 = require("./assessment-codec");
const assessment_specs_1 = require("./assessment-specs");
const withDoc = { document: { include: { files: { orderBy: { sortOrder: 'asc' }, select: { id: true, fileName: true, mimeType: true } } } } };
let CareAssessmentService = CareAssessmentService_1 = class CareAssessmentService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    specs() {
        return assessment_specs_1.ASSESSMENT_TYPES.map((t) => assessment_specs_1.FORM_SPECS[t]);
    }
    static specOf(type) {
        const spec = assessment_specs_1.FORM_SPECS[type];
        if (!spec)
            throw new common_1.NotFoundException(`未知的评估表类型：${type}`);
        return spec;
    }
    delegate(spec) {
        return this.prisma[spec.model];
    }
    fkOf(spec) {
        return spec.subject === 'MOTHER' ? 'motherProfileId' : 'babyProfileId';
    }
    async overview(motherProfileId) {
        const mother = await this.prisma.motherProfile.findFirst({
            where: { id: motherProfileId, tenantId: this.ctx.tenantId },
            include: { babies: { orderBy: { sequenceNo: 'asc' } } },
        });
        if (!mother)
            throw new common_1.NotFoundException('母婴档案不存在');
        const get = (spec, profileId) => this.delegate(spec).findUnique({ where: { [this.fkOf(spec)]: profileId }, include: withDoc });
        const [motherAdmission, motherDischarge] = await Promise.all([get(assessment_specs_1.FORM_SPECS.MOTHER_ADMISSION, mother.id), get(assessment_specs_1.FORM_SPECS.MOTHER_DISCHARGE, mother.id)]);
        const babies = await Promise.all(mother.babies.map(async (b) => {
            const [admission, discharge] = await Promise.all([get(assessment_specs_1.FORM_SPECS.BABY_ADMISSION, b.id), get(assessment_specs_1.FORM_SPECS.BABY_DISCHARGE, b.id)]);
            return { baby: { id: b.id, sequenceNo: b.sequenceNo, name: b.name, gender: b.gender, birthDate: b.birthDate }, admission, discharge };
        }));
        return { motherProfileId: mother.id, motherAdmission, motherDischarge, babies };
    }
    async resolveProfile(spec, profileId) {
        const p = spec.subject === 'MOTHER'
            ? await this.prisma.motherProfile.findFirst({ where: { id: profileId, tenantId: this.ctx.tenantId }, select: { storeId: true } })
            : await this.prisma.babyProfile.findFirst({ where: { id: profileId, tenantId: this.ctx.tenantId }, select: { storeId: true } });
        if (!p)
            throw new common_1.NotFoundException(spec.subject === 'MOTHER' ? '妈妈档案不存在' : '宝宝档案不存在');
        return p;
    }
    async assertDocument(spec, profileId, documentId) {
        const doc = await this.prisma.careDocument.findFirst({ where: { id: documentId, tenantId: this.ctx.tenantId } });
        if (!doc)
            throw new common_1.BadRequestException('关联的纸质资料不存在');
        if (doc.docType !== spec.type)
            throw new common_1.BadRequestException('关联的纸质资料类型和这张评估表不一致');
        const owner = spec.subject === 'MOTHER' ? doc.motherProfileId : doc.babyProfileId;
        if (owner !== profileId)
            throw new common_1.BadRequestException('关联的纸质资料不属于这个档案');
    }
    async create(type, dto) {
        const spec = CareAssessmentService_1.specOf(type);
        const { storeId } = await this.resolveProfile(spec, dto.profileId);
        const fk = this.fkOf(spec);
        const existing = await this.delegate(spec).findUnique({ where: { [fk]: dto.profileId } });
        if (existing)
            throw new common_1.ConflictException(`该档案已有一份「${spec.title}」，请直接修改，不要重复新建`);
        if (dto.documentId)
            await this.assertDocument(spec, dto.profileId, dto.documentId);
        const data = (0, assessment_codec_1.toDbData)(spec, dto.values);
        const created = await this.delegate(spec).create({
            data: { ...data, tenantId: this.ctx.tenantId, storeId, [fk]: dto.profileId, documentId: dto.documentId ?? null, createdBy: this.ctx.accountId },
            include: withDoc,
        });
        if (dto.documentId)
            await this.confirmDocument(dto.documentId);
        await this.syncBabyProfile(spec, dto.profileId, created);
        await this.audit('CREATE', spec, created.id, null, created);
        return created;
    }
    async update(type, id, dto) {
        const spec = CareAssessmentService_1.specOf(type);
        const fk = this.fkOf(spec);
        const before = await this.delegate(spec).findUnique({ where: { id } });
        if (!before || before.tenantId !== this.ctx.tenantId)
            throw new common_1.NotFoundException(`${spec.title}不存在`);
        if (before.version !== dto.version)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        if (dto.documentId)
            await this.assertDocument(spec, before[fk], dto.documentId);
        const data = (0, assessment_codec_1.toDbData)(spec, dto.values);
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.delegate(spec).update({
            where: { id, version: dto.version },
            data: { ...data, ...(dto.documentId !== undefined ? { documentId: dto.documentId } : {}), version: { increment: 1 } },
            include: withDoc,
        }));
        if (dto.documentId)
            await this.confirmDocument(dto.documentId);
        await this.syncBabyProfile(spec, before[fk], updated);
        await this.audit('UPDATE', spec, id, before, updated, Object.keys(data));
        return updated;
    }
    async syncBabyProfile(spec, babyProfileId, row) {
        if (spec.type !== 'BABY_ADMISSION')
            return;
        const baby = await this.prisma.babyProfile.findFirst({ where: { id: babyProfileId, tenantId: this.ctx.tenantId }, select: { birthDate: true, birthWeightGrams: true } });
        if (!baby)
            return;
        const data = {};
        if (!baby.birthDate && row.birthDate instanceof Date)
            data.birthDate = row.birthDate;
        if (!baby.birthWeightGrams && typeof row.birthWeightG === 'number')
            data.birthWeightGrams = row.birthWeightG;
        if (Object.keys(data).length)
            await this.prisma.babyProfile.update({ where: { id: babyProfileId }, data });
    }
    async confirmDocument(documentId) {
        await this.prisma.careDocument.updateMany({
            where: { id: documentId, tenantId: this.ctx.tenantId, status: 'DRAFT' },
            data: { status: 'CONFIRMED', confirmedBy: this.ctx.accountId, confirmedAt: new Date() },
        });
    }
    async audit(action, spec, id, before, after, changedFields) {
        await this.auditLogService.record({
            action,
            entityType: spec.model,
            entityId: id,
            beforeData: before ?? undefined,
            afterData: after,
            changedFields,
            remark: spec.title,
            tenantId: this.ctx.tenantId,
            storeId: this.ctx.homeStoreId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
    }
};
exports.CareAssessmentService = CareAssessmentService;
exports.CareAssessmentService = CareAssessmentService = CareAssessmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CareAssessmentService);
//# sourceMappingURL=care-assessment.service.js.map