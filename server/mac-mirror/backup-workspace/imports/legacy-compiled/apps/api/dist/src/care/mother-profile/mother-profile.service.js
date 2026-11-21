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
exports.MotherProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const risk_tag_util_1 = require("../risk-tag.util");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const customer_service_1 = require("../../crm/customer/customer.service");
const care_storage_service_1 = require("../care-document/care-storage.service");
const profile_delete_util_1 = require("../profile-delete.util");
const recycle_bin_service_1 = require("../../common/recycle/recycle-bin.service");
const includeProfile = {
    babies: { orderBy: { sequenceNo: 'asc' } },
    primaryNurse: { select: { id: true, realName: true } },
};
let MotherProfileService = class MotherProfileService {
    prisma;
    customerService;
    storage;
    recycleBin;
    auditLogService;
    ctx;
    constructor(prisma, customerService, storage, recycleBin, auditLogService, ctx) {
        this.prisma = prisma;
        this.customerService = customerService;
        this.storage = storage;
        this.recycleBin = recycleBin;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.motherProfile.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                customerId: query.customerId,
                storeId: query.storeId,
                ...(query.archived === 'only' ? { archivedAt: { not: null } } : query.archived === 'all' ? {} : { archivedAt: null }),
            },
            include: {
                ...includeProfile,
                customer: { select: { name: true, phone: true } },
                occupancy: { select: { occupancyNo: true, status: true, room: { select: { roomNo: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const profile = await this.prisma.motherProfile.findUnique({ where: { id }, include: includeProfile });
        if (!profile)
            throw new common_1.NotFoundException(`MotherProfile ${id} 不存在`);
        return profile;
    }
    async getDeleteCheck(id) {
        const p = await this.findOneOrThrow(id);
        if (p.tenantId !== this.ctx.tenantId)
            throw new common_1.NotFoundException(`MotherProfile ${id} 不存在`);
        const customer = await this.prisma.customer.findUnique({ where: { id: p.customerId }, select: { name: true } });
        const check = await (0, profile_delete_util_1.motherProfilesDeleteCheck)(this.prisma, [id]);
        return {
            profileId: id,
            customerName: customer?.name ?? '',
            blockers: check.blockers,
            attached: [...(check.babyCount ? [`${check.babyCount} 个宝宝档案`] : []), ...check.attached],
            canForceDelete: await this.ctx.hasPermission('care.profile.force-delete'),
            archived: !!p.archivedAt,
        };
    }
    async remove(id, force = false, confirmName) {
        const check = await this.getDeleteCheck(id);
        const before = await this.findOneOrThrow(id);
        const superAdmin = await this.ctx.hasPermission('crm.customer.force-delete');
        if (check.blockers.length > 0 && !(force && superAdmin)) {
            throw new common_1.ConflictException(`该档案已有${check.blockers.join('、')}，属于护理痕迹，不能删除；不再使用请点“归档”`);
        }
        if (check.attached.length > 0 || check.blockers.length > 0) {
            if (!force)
                throw new common_1.ConflictException(`该档案名下已有${check.attached.join('、')}，直接删除会丢失这些数据；需要管理员确认后连同它们一起删除`);
            if (!check.canForceDelete)
                throw new common_1.ForbiddenException('该档案名下已有宝宝/评估表/纸质资料，连同删除需要管理员权限，请联系管理员');
            if (confirmName?.trim() !== check.customerName)
                throw new common_1.BadRequestException(`请输入客户姓名「${check.customerName}」确认删除`);
        }
        await this.recycleBin.deleteToBin({
            entityType: 'MOTHER_PROFILE',
            rootTable: 'mother_profiles',
            rootId: id,
            title: `${check.customerName} 的母婴档案`,
            addExtras: profile_delete_util_1.addProfileExtras,
        });
        await this.auditLogService.record({
            action: 'DELETE',
            entityType: 'MotherProfile',
            entityId: id,
            beforeData: before,
            remark: check.attached.length > 0 ? `管理员连同 ${check.attached.join('、')} 一起删除母婴档案（客户：${check.customerName}）` : `删除母婴档案（客户：${check.customerName}）`,
            ...this.auditCtx(),
        });
    }
    async archive(id) {
        const before = await this.findOneOrThrow(id);
        if (before.archivedAt)
            throw new common_1.ConflictException('这份档案已经归档了');
        await this.prisma.motherProfile.update({ where: { id }, data: { archivedAt: new Date(), archivedBy: this.ctx.accountId, version: { increment: 1 } } });
        await this.auditLogService.record({ action: 'UPDATE', entityType: 'MotherProfile', entityId: id, remark: '归档母婴档案', ...this.auditCtx() });
    }
    async restore(id) {
        const before = await this.findOneOrThrow(id);
        if (!before.archivedAt)
            throw new common_1.ConflictException('这份档案没有归档');
        await this.prisma.motherProfile.update({ where: { id }, data: { archivedAt: null, archivedBy: null, version: { increment: 1 } } });
        await this.auditLogService.record({ action: 'UPDATE', entityType: 'MotherProfile', entityId: id, remark: '恢复已归档的母婴档案', ...this.auditCtx() });
    }
    async formOptions() {
        const tenantId = this.ctx.tenantId;
        const [customers, riskTags] = await Promise.all([
            this.prisma.customer.findMany({ where: { tenantId, archivedAt: null }, select: { id: true, name: true, phone: true, allergens: true }, orderBy: { createdAt: 'desc' }, take: 2000 }),
            this.prisma.tag.findMany({ where: { tenantId, category: 'CARE_RISK' }, orderBy: { name: 'asc' } }),
        ]);
        const mask = (p) => (p && p.length >= 7 ? `${p.slice(0, 3)}****${p.slice(-4)}` : (p ?? ''));
        return { customers: customers.map((c) => ({ id: c.id, name: c.name, phone: mask(c.phone), allergens: c.allergens ?? null })), riskTags };
    }
    async nurseOptions(storeId) {
        const accounts = await this.prisma.account.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                status: 'ACTIVE',
                ...(storeId ? { OR: [{ storeId }, { storeId: null }] } : {}),
            },
            select: {
                id: true,
                realName: true,
                position: { select: { name: true } },
                department: { select: { name: true } },
                roleAssignments: { select: { role: { select: { name: true } } } },
            },
            orderBy: { realName: 'asc' },
        });
        return accounts
            .map((a) => {
            const labels = [a.position?.name, ...a.roleAssignments.map((r) => r.role.name)].filter((x) => !!x);
            const isNurse = [...labels, a.department?.name ?? ''].some((x) => x.includes('护理') || x.includes('护士') || x.includes('月嫂'));
            return { id: a.id, name: a.realName, roles: [...new Set(labels)], isNurse };
        })
            .sort((x, y) => Number(y.isNurse) - Number(x.isNurse));
    }
    async assertNurse(id) {
        if (!id)
            return;
        const acc = await this.prisma.account.findFirst({ where: { id, tenantId: this.ctx.tenantId, status: 'ACTIVE' }, select: { id: true } });
        if (!acc)
            throw new common_1.BadRequestException('所选护理师不存在或已停用');
    }
    async getRiskTags(entityType, entityId) {
        return this.prisma.tagBinding.findMany({ where: { entityType, entityId, revokedAt: null }, include: { tag: true } });
    }
    async setRiskTags(id, tagIds) {
        await this.findOneOrThrow(id);
        const r = await (0, risk_tag_util_1.replaceRiskTags)(this.prisma, { tenantId: this.ctx.tenantId, accountId: this.ctx.accountId, entityType: 'MOTHER_PROFILE', entityId: id, tagIds });
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'MotherProfile',
            entityId: id,
            remark: `修改风险标签：新增 ${r.added.length} 个，撤销 ${r.removed.length} 个`,
            tenantId: this.ctx.tenantId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return this.getRiskTags('MOTHER_PROFILE', id);
    }
    async assertTagsExist(tagIds) {
        if (tagIds.length === 0)
            return;
        const tags = await this.prisma.tag.findMany({ where: { id: { in: tagIds }, tenantId: this.ctx.tenantId } });
        if (tags.length !== new Set(tagIds).size) {
            throw new common_1.BadRequestException('存在不存在的标签 ID');
        }
    }
    async create(dto) {
        await this.customerService.assertActive(dto.customerId);
        let storeId = this.ctx.homeStoreId ?? undefined;
        if (dto.occupancyId) {
            const occupancy = await this.prisma.roomOccupancy.findUnique({ where: { id: dto.occupancyId } });
            if (!occupancy)
                throw new common_1.NotFoundException(`RoomOccupancy ${dto.occupancyId} 不存在`);
            if (occupancy.customerId !== dto.customerId) {
                throw new common_1.BadRequestException('入住记录与客户不匹配');
            }
            storeId = occupancy.storeId;
        }
        if (!storeId)
            throw new common_1.BadRequestException('无法确定档案所属门店：请提供入住记录或使用有门店归属的账号操作');
        await this.assertTagsExist(dto.riskTagIds ?? []);
        for (const baby of dto.babies ?? []) {
            await this.assertTagsExist(baby.riskTagIds ?? []);
        }
        await this.assertNurse(dto.primaryNurseId);
        let occupancyId = dto.occupancyId;
        if (!occupancyId) {
            const candidates = await this.prisma.roomOccupancy.findMany({
                where: { tenantId: this.ctx.tenantId, customerId: dto.customerId, status: { in: ['CHECKED_IN', 'RESERVED'] } },
                orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
            });
            for (const c of candidates) {
                if ((await this.prisma.motherProfile.count({ where: { occupancyId: c.id } })) === 0) {
                    occupancyId = c.id;
                    storeId = c.storeId;
                    break;
                }
            }
        }
        const created = await this.prisma.$transaction(async (tx) => {
            const profile = await tx.motherProfile.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId,
                    customerId: dto.customerId,
                    occupancyId,
                    deliveryMethod: dto.deliveryMethod,
                    deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
                    gestationalWeeks: dto.gestationalWeeks,
                    expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : undefined,
                    careNote: dto.careNote,
                    allergens: dto.allergens !== undefined ? dto.allergens.trim() || null : (await tx.customer.findUnique({ where: { id: dto.customerId }, select: { allergens: true } }))?.allergens ?? null,
                    primaryNurseId: dto.primaryNurseId,
                    remark: dto.remark,
                    createdBy: this.ctx.accountId,
                },
            });
            for (const [index, baby] of (dto.babies ?? []).entries()) {
                const babyProfile = await tx.babyProfile.create({
                    data: {
                        tenantId: this.ctx.tenantId,
                        storeId,
                        customerId: dto.customerId,
                        motherProfileId: profile.id,
                        sequenceNo: index + 1,
                        name: baby.name,
                        gender: baby.gender,
                        birthDate: baby.birthDate ? new Date(baby.birthDate) : undefined,
                        birthWeightGrams: baby.birthWeightGrams,
                        apgarScore: baby.apgarScore,
                        allergens: baby.allergens?.trim() || null,
                        remark: baby.remark,
                        createdBy: this.ctx.accountId,
                    },
                });
                for (const tagId of baby.riskTagIds ?? []) {
                    await tx.tagBinding.create({
                        data: { tagId, entityType: 'BABY_PROFILE', entityId: babyProfile.id, tenantId: this.ctx.tenantId, createdBy: this.ctx.accountId },
                    });
                }
            }
            for (const tagId of dto.riskTagIds ?? []) {
                await tx.tagBinding.create({
                    data: { tagId, entityType: 'MOTHER_PROFILE', entityId: profile.id, tenantId: this.ctx.tenantId, createdBy: this.ctx.accountId },
                });
            }
            return profile;
        });
        const withBabies = await this.findOneOrThrow(created.id);
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'MotherProfile',
            entityId: created.id,
            afterData: withBabies,
            ...this.auditCtx(),
        });
        return withBabies;
    }
    async update(id, dto) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== dto.version) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        await this.assertNurse(dto.primaryNurseId);
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.motherProfile.update({
            where: { id, version: dto.version },
            data: {
                occupancyId: dto.occupancyId,
                deliveryMethod: dto.deliveryMethod,
                deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
                gestationalWeeks: dto.gestationalWeeks,
                expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : undefined,
                careNote: dto.careNote,
                allergens: dto.allergens === undefined ? undefined : dto.allergens.trim() || null,
                primaryNurseId: dto.primaryNurseId,
                remark: dto.remark,
                version: { increment: 1 },
            },
        }));
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'MotherProfile',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: Object.keys(dto).filter((k) => k !== 'version'),
            ...this.auditCtx(),
        });
        return updated;
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
exports.MotherProfileService = MotherProfileService;
exports.MotherProfileService = MotherProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        customer_service_1.CustomerService,
        care_storage_service_1.CareStorageService,
        recycle_bin_service_1.RecycleBinService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], MotherProfileService);
//# sourceMappingURL=mother-profile.service.js.map