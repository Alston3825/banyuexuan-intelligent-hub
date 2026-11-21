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
exports.BabyProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const risk_tag_util_1 = require("../risk-tag.util");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const care_storage_service_1 = require("../care-document/care-storage.service");
let BabyProfileService = class BabyProfileService {
    prisma;
    auditLogService;
    ctx;
    storage;
    constructor(prisma, auditLogService, ctx, storage) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
        this.storage = storage;
    }
    findMany(query = {}) {
        return this.prisma.babyProfile.findMany({
            where: { tenantId: this.ctx.tenantId, motherProfileId: query.motherProfileId, customerId: query.customerId },
            orderBy: [{ motherProfileId: 'asc' }, { sequenceNo: 'asc' }],
        });
    }
    getRiskTags(id) {
        return this.prisma.tagBinding.findMany({ where: { entityType: 'BABY_PROFILE', entityId: id, revokedAt: null }, include: { tag: true } });
    }
    async setRiskTags(id, tagIds) {
        await this.findOneOrThrow(id);
        const r = await (0, risk_tag_util_1.replaceRiskTags)(this.prisma, { tenantId: this.ctx.tenantId, accountId: this.ctx.accountId, entityType: 'BABY_PROFILE', entityId: id, tagIds });
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'BabyProfile',
            entityId: id,
            remark: `修改风险标签：新增 ${r.added.length} 个，撤销 ${r.removed.length} 个`,
            tenantId: this.ctx.tenantId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return this.getRiskTags(id);
    }
    async findOneOrThrow(id) {
        const baby = await this.prisma.babyProfile.findUnique({ where: { id } });
        if (!baby)
            throw new common_1.NotFoundException(`BabyProfile ${id} 不存在`);
        return baby;
    }
    async create(dto) {
        const motherProfile = await this.prisma.motherProfile.findUnique({ where: { id: dto.motherProfileId } });
        if (!motherProfile)
            throw new common_1.NotFoundException(`MotherProfile ${dto.motherProfileId} 不存在`);
        if ((dto.riskTagIds ?? []).length > 0) {
            const tags = await this.prisma.tag.findMany({ where: { id: { in: dto.riskTagIds }, tenantId: this.ctx.tenantId } });
            if (tags.length !== new Set(dto.riskTagIds).size) {
                throw new common_1.BadRequestException('存在不存在的标签 ID');
            }
        }
        const created = await this.prisma.$transaction(async (tx) => {
            const maxSeq = await tx.babyProfile.aggregate({
                where: { motherProfileId: dto.motherProfileId },
                _max: { sequenceNo: true },
            });
            const babyProfile = await tx.babyProfile.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId: motherProfile.storeId,
                    customerId: motherProfile.customerId,
                    motherProfileId: dto.motherProfileId,
                    sequenceNo: (maxSeq._max.sequenceNo ?? 0) + 1,
                    name: dto.name,
                    gender: dto.gender,
                    birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
                    birthWeightGrams: dto.birthWeightGrams,
                    apgarScore: dto.apgarScore,
                    allergens: dto.allergens?.trim() || null,
                    remark: dto.remark,
                    createdBy: this.ctx.accountId,
                },
            });
            for (const tagId of dto.riskTagIds ?? []) {
                await tx.tagBinding.create({
                    data: { tagId, entityType: 'BABY_PROFILE', entityId: babyProfile.id, tenantId: this.ctx.tenantId, createdBy: this.ctx.accountId },
                });
            }
            return babyProfile;
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'BabyProfile',
            entityId: created.id,
            afterData: created,
            ...this.auditCtx(),
        });
        return created;
    }
    async update(id, dto) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== dto.version) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.babyProfile.update({
            where: { id, version: dto.version },
            data: {
                name: dto.name,
                gender: dto.gender,
                birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
                birthWeightGrams: dto.birthWeightGrams,
                apgarScore: dto.apgarScore,
                allergens: dto.allergens === undefined ? undefined : dto.allergens.trim() || null,
                remark: dto.remark,
                version: { increment: 1 },
            },
        }));
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'BabyProfile',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: Object.keys(dto).filter((k) => k !== 'version'),
            ...this.auditCtx(),
        });
        return updated;
    }
    async getDeleteCheck(id) {
        const baby = await this.findOneOrThrow(id);
        if (baby.tenantId !== this.ctx.tenantId)
            throw new common_1.NotFoundException(`BabyProfile ${id} 不存在`);
        const [records, plans, abnormalities, documents, admissions, discharges, dailies, medications, planVersions, serviceLogs, canForceDelete] = await Promise.all([
            this.prisma.careRecord.count({ where: { babyProfileId: id } }),
            this.prisma.carePlan.count({ where: { babyProfileId: id } }),
            this.prisma.careAbnormality.count({ where: { babyProfileId: id } }),
            this.prisma.careDocument.count({ where: { babyProfileId: id } }),
            this.prisma.careBabyAdmission.count({ where: { babyProfileId: id } }),
            this.prisma.careBabyDischarge.count({ where: { babyProfileId: id } }),
            this.prisma.careDailyBabyRecord.count({ where: { babyProfileId: id } }),
            this.prisma.careMedicationAuth.count({ where: { babyProfileId: id } }),
            this.prisma.carePlanVersion.count({ where: { babyProfileId: id } }),
            this.prisma.careServiceLog.count({ where: { babyProfileId: id } }),
            this.ctx.hasPermission('care.profile.force-delete'),
        ]);
        const blockers = [records && `${records} 条护理记录`, dailies && `${dailies} 天日常护理记录`, plans && `${plans} 个护理计划`, abnormalities && `${abnormalities} 条护理异常`].filter(Boolean);
        const attached = [admissions && '新生儿入所评估', discharges && '宝宝出所评估', medications && `${medications} 份用药委托书`, planVersions && `${planVersions} 个护理计划版本`, serviceLogs && `${serviceLogs} 条服务执行记录`, documents && `${documents} 份纸质资料`].filter(Boolean);
        return {
            babyId: id,
            babyName: baby.name?.trim() || `宝宝${baby.sequenceNo}`,
            blockers,
            attached,
            canForceDelete,
        };
    }
    async remove(id, force = false, confirmName) {
        const check = await this.getDeleteCheck(id);
        const baby = await this.findOneOrThrow(id);
        if (check.blockers.length > 0) {
            throw new common_1.ConflictException(`该宝宝已有${check.blockers.join('、')}，属于护理痕迹，不能删除`);
        }
        if (check.attached.length > 0) {
            if (!force) {
                throw new common_1.ConflictException(`该宝宝名下已有${check.attached.join('、')}，直接删除会丢失这些数据；需要管理员确认后连同它们一起删除`);
            }
            if (!check.canForceDelete) {
                throw new common_1.ForbiddenException('该宝宝名下已有评估表/纸质资料，连同删除需要管理员权限，请联系管理员');
            }
            if (confirmName?.trim() !== check.babyName) {
                throw new common_1.BadRequestException(`请输入宝宝名字「${check.babyName}」确认删除`);
            }
        }
        const docs = await this.prisma.careDocument.findMany({ where: { babyProfileId: id }, select: { id: true, docType: true } });
        await this.prisma.$transaction(async (tx) => {
            await tx.careBabyAdmission.deleteMany({ where: { babyProfileId: id } });
            await tx.careBabyDischarge.deleteMany({ where: { babyProfileId: id } });
            await tx.careMedicationAuth.deleteMany({ where: { babyProfileId: id } });
            await tx.carePlanVersion.deleteMany({ where: { babyProfileId: id } });
            await tx.careServiceLog.deleteMany({ where: { babyProfileId: id } });
            await tx.careDocument.deleteMany({ where: { babyProfileId: id } });
            await tx.tagBinding.deleteMany({ where: { entityType: 'BABY_PROFILE', entityId: id } });
            await tx.babyProfile.delete({ where: { id } });
            const rest = await tx.babyProfile.findMany({ where: { motherProfileId: baby.motherProfileId }, orderBy: { sequenceNo: 'asc' } });
            for (const [i, b] of rest.entries()) {
                if (b.sequenceNo !== i + 1)
                    await tx.babyProfile.update({ where: { id: b.id }, data: { sequenceNo: i + 1 } });
            }
        });
        for (const d of docs)
            await this.storage.removeDocumentDir(d.id).catch(() => undefined);
        await this.auditLogService.record({
            action: 'DELETE',
            entityType: 'BabyProfile',
            entityId: id,
            beforeData: baby,
            remark: check.attached.length > 0 ? `管理员连同 ${check.attached.join('、')} 一起删除宝宝档案` : '删除宝宝档案',
            ...this.auditCtx(),
        });
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
exports.BabyProfileService = BabyProfileService;
exports.BabyProfileService = BabyProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService,
        care_storage_service_1.CareStorageService])
], BabyProfileService);
//# sourceMappingURL=baby-profile.service.js.map