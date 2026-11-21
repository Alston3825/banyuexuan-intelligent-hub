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
exports.CareMedicationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const assessment_codec_1 = require("../care-assessment/assessment-codec");
const medication_specs_1 = require("./medication-specs");
const headerSpec = { groups: [{ title: '表头', fields: medication_specs_1.MED_HEADER_FIELDS }] };
const itemSpec = { groups: [{ title: '药品', fields: medication_specs_1.MED_ITEM_COLUMNS }] };
const include = {
    items: { orderBy: { sortOrder: 'asc' } },
    document: { select: { id: true, status: true, files: { orderBy: { sortOrder: 'asc' }, select: { id: true, fileName: true, mimeType: true } } } },
    babyProfile: { select: { id: true, sequenceNo: true, name: true, gender: true } },
};
const ymd = (d) => d.toISOString().slice(0, 10);
let CareMedicationService = class CareMedicationService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    specs() {
        return { header: medication_specs_1.MED_HEADER_FIELDS, item: medication_specs_1.MED_ITEM_COLUMNS };
    }
    list(query) {
        return this.prisma.careMedicationAuth.findMany({
            where: { tenantId: this.ctx.tenantId, motherProfileId: query.motherProfileId, babyProfileId: query.babyProfileId },
            include,
            orderBy: [{ createdAt: 'desc' }],
        });
    }
    async getOrThrow(id) {
        const a = await this.prisma.careMedicationAuth.findFirst({ where: { id, tenantId: this.ctx.tenantId }, include });
        if (!a)
            throw new common_1.NotFoundException('用药委托书不存在');
        return a;
    }
    async activeItems(babyIds, date) {
        if (babyIds.length === 0)
            return {};
        const auths = await this.prisma.careMedicationAuth.findMany({
            where: { tenantId: this.ctx.tenantId, babyProfileId: { in: babyIds }, status: 'ACTIVE' },
            include: { items: { orderBy: { sortOrder: 'asc' } } },
        });
        const out = {};
        for (const a of auths) {
            if (a.medicationStart && ymd(a.medicationStart) > date)
                continue;
            for (const it of a.items) {
                if (it.startDate && ymd(it.startDate) > date)
                    continue;
                if (it.endDate && ymd(it.endDate) < date)
                    continue;
                (out[a.babyProfileId] ??= []).push({ authId: a.id, drugName: it.drugName, route: it.route, times: it.times, dose: it.dose });
            }
        }
        return out;
    }
    parseItems(rows) {
        const items = (rows ?? []).map((r, i) => {
            const data = (0, assessment_codec_1.toDbData)(itemSpec, r);
            if (!data.drugName)
                throw new common_1.BadRequestException(`第 ${i + 1} 行药品没有填药名`);
            return { ...data, sortOrder: i };
        });
        if (items.length === 0)
            throw new common_1.BadRequestException('请至少填写一种药品');
        return items;
    }
    async assertDocument(docId, babyProfileId) {
        const doc = await this.prisma.careDocument.findFirst({ where: { id: docId, tenantId: this.ctx.tenantId } });
        if (!doc || doc.docType !== 'MEDICATION_AUTH' || doc.babyProfileId !== babyProfileId)
            throw new common_1.BadRequestException('关联的纸质资料不存在，或不是这个宝宝的用药委托书');
    }
    async confirmDoc(docId) {
        await this.prisma.careDocument.updateMany({
            where: { id: docId, tenantId: this.ctx.tenantId, status: 'DRAFT' },
            data: { status: 'CONFIRMED', confirmedBy: this.ctx.accountId, confirmedAt: new Date() },
        });
    }
    async create(dto) {
        if (!dto.babyProfileId)
            throw new common_1.BadRequestException('请选择宝宝');
        const baby = await this.prisma.babyProfile.findFirst({ where: { id: dto.babyProfileId, tenantId: this.ctx.tenantId } });
        if (!baby)
            throw new common_1.NotFoundException('宝宝档案不存在');
        if (dto.motherProfileId && dto.motherProfileId !== baby.motherProfileId)
            throw new common_1.BadRequestException('宝宝和妈妈档案不匹配');
        const header = (0, assessment_codec_1.toDbData)(headerSpec, dto.header ?? {});
        const items = this.parseItems(dto.items);
        if (dto.documentId)
            await this.assertDocument(dto.documentId, baby.id);
        let previous = null;
        if (dto.previousAuthId) {
            previous = await this.getOrThrow(dto.previousAuthId);
            if (previous.babyProfileId !== baby.id)
                throw new common_1.BadRequestException('上一份委托书不是这个宝宝的');
            if (previous.status !== 'ACTIVE')
                throw new common_1.ConflictException('上一份委托书已不是有效状态，不能再基于它变更');
            if (!dto.changeNote?.trim())
                throw new common_1.BadRequestException('变更委托书请填写变更说明（相比上一份改了什么、为什么）');
        }
        const tenantId = this.ctx.tenantId;
        const accountId = this.ctx.accountId;
        const created = await this.prisma.$transaction(async (tx) => {
            if (previous)
                await tx.careMedicationAuth.update({ where: { id: previous.id }, data: { status: 'SUPERSEDED', version: { increment: 1 } } });
            return tx.careMedicationAuth.create({
                data: {
                    ...header,
                    tenantId,
                    storeId: baby.storeId,
                    motherProfileId: baby.motherProfileId,
                    babyProfileId: baby.id,
                    previousAuthId: previous?.id ?? null,
                    changeNote: dto.changeNote?.trim() || null,
                    documentId: dto.documentId ?? null,
                    createdBy: accountId,
                    items: { create: items.map((it) => ({ ...it, tenantId })) },
                },
                include,
            });
        });
        if (dto.documentId)
            await this.confirmDoc(dto.documentId);
        await this.audit(previous ? 'STATE_TRANSITION' : 'CREATE', created.id, baby.storeId, previous ? `变更用药委托书（替换 ${previous.id}）` : '新建用药委托书', { items: items.map((i) => i.drugName) });
        return created;
    }
    async update(id, dto) {
        const before = await this.getOrThrow(id);
        if (dto.version !== before.version)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        const header = (0, assessment_codec_1.toDbData)(headerSpec, dto.header ?? {});
        const touchesContent = Object.keys(dto.header ?? {}).length > 0 || (dto.items ?? []).length > 0;
        if (before.status !== 'ACTIVE' && touchesContent)
            throw new common_1.ConflictException('这份委托书已被替换或已停药，属于历史记录，不能修改内容；需要调整请新签一份');
        if (dto.documentId)
            await this.assertDocument(dto.documentId, before.babyProfileId);
        const items = (dto.items ?? []).length > 0 ? this.parseItems(dto.items) : null;
        await this.prisma.$transaction(async (tx) => {
            await (0, versioned_update_util_1.runVersionedUpdate)(() => tx.careMedicationAuth.update({
                where: { id, version: before.version },
                data: {
                    ...(before.status === 'ACTIVE' ? header : {}),
                    ...(dto.changeNote !== undefined && before.status === 'ACTIVE' ? { changeNote: dto.changeNote?.trim() || null } : {}),
                    ...(dto.documentId !== undefined ? { documentId: dto.documentId } : {}),
                    version: { increment: 1 },
                },
            }));
            if (items) {
                await tx.careMedicationItem.deleteMany({ where: { authId: id } });
                await tx.careMedicationItem.createMany({ data: items.map((it) => ({ ...it, tenantId: this.ctx.tenantId, authId: id })) });
            }
        });
        if (dto.documentId)
            await this.confirmDoc(dto.documentId);
        const after = await this.getOrThrow(id);
        await this.audit('UPDATE', id, before.storeId, '修改用药委托书', { before: before.items.map((i) => i.drugName), after: after.items.map((i) => i.drugName) });
        return after;
    }
    async stop(id, dto) {
        const before = await this.getOrThrow(id);
        if (dto.version !== before.version)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        if (before.status !== 'ACTIVE')
            throw new common_1.ConflictException('这份委托书已不是有效状态');
        if (!dto.note?.trim())
            throw new common_1.BadRequestException('请填写停药原因/说明');
        await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.careMedicationAuth.update({
            where: { id, version: before.version },
            data: { status: 'STOPPED', stoppedAt: new Date(), stoppedBy: this.ctx.accountId, stopNote: dto.note.trim(), version: { increment: 1 } },
        }));
        await this.audit('STATE_TRANSITION', id, before.storeId, `停药：${dto.note.trim()}`, { items: before.items.map((i) => i.drugName) });
        return this.getOrThrow(id);
    }
    audit(action, id, storeId, remark, data) {
        return this.auditLogService.record({
            action,
            entityType: 'CareMedicationAuth',
            entityId: id,
            afterData: data,
            remark,
            tenantId: this.ctx.tenantId,
            storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
    }
};
exports.CareMedicationService = CareMedicationService;
exports.CareMedicationService = CareMedicationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CareMedicationService);
//# sourceMappingURL=care-medication.service.js.map