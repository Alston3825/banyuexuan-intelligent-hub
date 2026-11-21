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
exports.CareServiceLogService = exports.CarePlanVersionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const service_sheet_specs_1 = require("./service-sheet-specs");
const care_standards_1 = require("./care-standards");
const DAY_MS = 86_400_000;
const REVIEW_INTERVAL_DAYS = 7;
const LEVELS = ['LEVEL1', 'LEVEL2', 'LEVEL3'];
const SOURCES = ['INITIAL', 'REGULAR_REVIEW', 'DIRECTOR_ROUND'];
const beijingToday = () => new Date(`${new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10)}T00:00:00.000Z`);
const ymd = (d) => d.toISOString().slice(0, 10);
let CarePlanVersionService = class CarePlanVersionService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    async standards() {
        return {
            reviewIntervalDays: REVIEW_INTERVAL_DAYS,
            canApprove: await this.ctx.hasPermission('care.profile.approve'),
            levels: ['LEVEL1', 'LEVEL2', 'LEVEL3'].map((k) => ({
                code: k,
                label: care_standards_1.LEVEL_STANDARDS[k].label,
                desc: care_standards_1.LEVEL_STANDARDS[k].desc,
                services: care_standards_1.LEVEL_STANDARDS[k].services.map((s) => ({ ...s, freqText: (0, care_standards_1.freqText)(s.freq) })),
            })),
        };
    }
    async me() {
        const a = await this.prisma.account.findUnique({ where: { id: this.ctx.accountId }, select: { realName: true } });
        return a?.realName ?? null;
    }
    list(motherProfileId) {
        return this.prisma.carePlanVersion.findMany({
            where: { tenantId: this.ctx.tenantId, motherProfileId },
            orderBy: [{ versionNo: 'desc' }],
        });
    }
    async getOrThrow(id) {
        const v = await this.prisma.carePlanVersion.findFirst({ where: { id, tenantId: this.ctx.tenantId } });
        if (!v)
            throw new common_1.NotFoundException('护理计划版本不存在');
        return v;
    }
    cleanMeasures(m) {
        if (m === undefined)
            return undefined;
        return (m ?? [])
            .map((x) => ({ title: String(x.title ?? '').trim(), content: String(x.content ?? '').trim(), frequency: String(x.frequency ?? '').trim() }))
            .filter((x) => x.title || x.content);
    }
    async assertCanApprove() {
        if (!(await this.ctx.hasPermission('care.profile.approve')))
            throw new common_1.ForbiddenException('审核护理计划需要护理主任权限');
    }
    async create(dto) {
        if (!dto.motherProfileId)
            throw new common_1.BadRequestException('缺少母婴档案');
        const mother = await this.prisma.motherProfile.findFirst({ where: { id: dto.motherProfileId, tenantId: this.ctx.tenantId } });
        if (!mother)
            throw new common_1.NotFoundException('母婴档案不存在');
        if (dto.babyProfileId) {
            const baby = await this.prisma.babyProfile.findFirst({ where: { id: dto.babyProfileId, motherProfileId: mother.id } });
            if (!baby)
                throw new common_1.BadRequestException('宝宝不属于这个母婴档案');
        }
        if (!LEVELS.includes(dto.level))
            throw new common_1.BadRequestException('请选择护理等级');
        const subject = { motherProfileId: mother.id, babyProfileId: dto.babyProfileId ?? null };
        const open = await this.prisma.carePlanVersion.findFirst({ where: { ...subject, tenantId: this.ctx.tenantId, status: { in: ['DRAFT', 'PENDING_REVIEW', 'REJECTED'] } } });
        if (open)
            throw new common_1.ConflictException('已有一个还没处理完的计划版本（编辑中/待审核/被驳回），请先处理它');
        const active = await this.prisma.carePlanVersion.findFirst({ where: { ...subject, tenantId: this.ctx.tenantId, status: 'ACTIVE' } });
        const latest = active ?? (await this.prisma.carePlanVersion.findFirst({ where: { ...subject, tenantId: this.ctx.tenantId }, orderBy: { versionNo: 'desc' } }));
        const source = SOURCES.includes(dto.source) ? dto.source : active ? 'REGULAR_REVIEW' : 'INITIAL';
        if (active && source === 'REGULAR_REVIEW' && !dto.progressNote?.trim())
            throw new common_1.BadRequestException('定期评审请填写“上阶段执行结果”');
        if (active && source === 'DIRECTOR_ROUND' && !dto.adjustReason?.trim())
            throw new common_1.BadRequestException('查房调整请填写调整原因');
        const direct = !!dto.directActivate;
        if (direct)
            await this.assertCanApprove();
        const name = await this.me();
        const max = await this.prisma.carePlanVersion.aggregate({ where: { ...subject, tenantId: this.ctx.tenantId }, _max: { versionNo: true } });
        const now = new Date();
        const created = await this.prisma.$transaction(async (tx) => {
            if (direct && active)
                await tx.carePlanVersion.update({ where: { id: active.id }, data: { status: 'SUPERSEDED', endedAt: now, version: { increment: 1 } } });
            return tx.carePlanVersion.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId: mother.storeId,
                    ...subject,
                    versionNo: (max._max.versionNo ?? 0) + 1,
                    status: direct ? 'ACTIVE' : 'DRAFT',
                    level: dto.level,
                    source: direct ? 'DIRECTOR_ROUND' : source,
                    assessmentSummary: dto.assessmentSummary?.trim() || null,
                    focusPoints: dto.focusPoints?.trim() || null,
                    measures: this.cleanMeasures(dto.measures) ?? [],
                    progressNote: dto.progressNote?.trim() || null,
                    adjustReason: dto.adjustReason?.trim() || null,
                    previousVersionId: latest?.id ?? null,
                    createdBy: this.ctx.accountId,
                    createdByName: name,
                    ...(direct
                        ? { submittedAt: now, reviewerId: this.ctx.accountId, reviewerName: name, reviewedAt: now, reviewComment: '护理主任直接调整并生效', effectiveAt: now, nextReviewDue: new Date(beijingToday().getTime() + REVIEW_INTERVAL_DAYS * DAY_MS) }
                        : {}),
                },
            });
        });
        await this.audit(direct ? 'STATE_TRANSITION' : 'CREATE', created, direct ? '护理主任直接调整并生效' : '起草护理计划版本');
        return created;
    }
    async update(id, dto) {
        const before = await this.getOrThrow(id);
        if (dto.version !== before.version)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        if (before.status !== 'DRAFT' && before.status !== 'REJECTED')
            throw new common_1.ConflictException('只有编辑中或被驳回的版本可以修改；已提交/已生效的版本不能改，需要调整请新建一个版本');
        if (dto.level !== undefined && !LEVELS.includes(dto.level))
            throw new common_1.BadRequestException('护理等级不正确');
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.carePlanVersion.update({
            where: { id, version: before.version },
            data: {
                ...(dto.level ? { level: dto.level } : {}),
                ...(dto.assessmentSummary !== undefined ? { assessmentSummary: dto.assessmentSummary?.trim() || null } : {}),
                ...(dto.focusPoints !== undefined ? { focusPoints: dto.focusPoints?.trim() || null } : {}),
                ...(dto.measures !== undefined ? { measures: this.cleanMeasures(dto.measures) } : {}),
                ...(dto.progressNote !== undefined ? { progressNote: dto.progressNote?.trim() || null } : {}),
                ...(dto.adjustReason !== undefined ? { adjustReason: dto.adjustReason?.trim() || null } : {}),
                status: 'DRAFT',
                version: { increment: 1 },
            },
        }));
        await this.audit('UPDATE', updated, '修改护理计划版本');
        return updated;
    }
    async submit(id, version) {
        const before = await this.getOrThrow(id);
        if (version !== before.version)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        if (before.status !== 'DRAFT' && before.status !== 'REJECTED')
            throw new common_1.ConflictException('这个版本不是编辑中状态');
        if (!before.focusPoints?.trim() && !before.assessmentSummary?.trim())
            throw new common_1.BadRequestException('请至少填写评估依据或重点关注后再提交');
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.carePlanVersion.update({ where: { id, version }, data: { status: 'PENDING_REVIEW', submittedAt: new Date(), version: { increment: 1 } } }));
        await this.audit('STATE_TRANSITION', updated, '提交护理主任审核');
        return updated;
    }
    async approve(id, version, comment) {
        await this.assertCanApprove();
        const before = await this.getOrThrow(id);
        if (version !== before.version)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        if (before.status !== 'PENDING_REVIEW')
            throw new common_1.ConflictException('这个版本不在待审核状态');
        const name = await this.me();
        const now = new Date();
        const updated = await this.prisma.$transaction(async (tx) => {
            await tx.carePlanVersion.updateMany({
                where: { tenantId: this.ctx.tenantId, motherProfileId: before.motherProfileId, babyProfileId: before.babyProfileId, status: 'ACTIVE' },
                data: { status: 'SUPERSEDED', endedAt: now },
            });
            return tx.carePlanVersion.update({
                where: { id, version },
                data: {
                    status: 'ACTIVE',
                    reviewerId: this.ctx.accountId,
                    reviewerName: name,
                    reviewedAt: now,
                    reviewComment: comment?.trim() || null,
                    effectiveAt: now,
                    nextReviewDue: new Date(beijingToday().getTime() + REVIEW_INTERVAL_DAYS * DAY_MS),
                    version: { increment: 1 },
                },
            });
        });
        await this.audit('STATE_TRANSITION', updated, '审核通过，计划生效');
        return updated;
    }
    async reject(id, version, comment) {
        await this.assertCanApprove();
        if (!comment?.trim())
            throw new common_1.BadRequestException('驳回请写明原因');
        const before = await this.getOrThrow(id);
        if (version !== before.version)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        if (before.status !== 'PENDING_REVIEW')
            throw new common_1.ConflictException('这个版本不在待审核状态');
        const name = await this.me();
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.carePlanVersion.update({
            where: { id, version },
            data: { status: 'REJECTED', reviewerId: this.ctx.accountId, reviewerName: name, reviewedAt: new Date(), reviewComment: comment.trim(), version: { increment: 1 } },
        }));
        await this.audit('STATE_TRANSITION', updated, `驳回：${comment.trim()}`);
        return updated;
    }
    async due(storeId) {
        const today = beijingToday();
        const where = { tenantId: this.ctx.tenantId, storeId };
        const [reviewDue, pending] = await Promise.all([
            this.prisma.carePlanVersion.findMany({ where: { ...where, status: 'ACTIVE', nextReviewDue: { lte: today } }, orderBy: { nextReviewDue: 'asc' } }),
            this.prisma.carePlanVersion.findMany({ where: { ...where, status: 'PENDING_REVIEW' }, orderBy: { submittedAt: 'asc' } }),
        ]);
        return { reviewDue, pending };
    }
    async activeForMothers(motherProfileIds) {
        if (motherProfileIds.length === 0)
            return new Map();
        const list = await this.prisma.carePlanVersion.findMany({
            where: { tenantId: this.ctx.tenantId, motherProfileId: { in: motherProfileIds }, babyProfileId: null, status: 'ACTIVE' },
        });
        return new Map(list.map((v) => [v.motherProfileId, v]));
    }
    audit(action, v, remark) {
        return this.auditLogService.record({
            action,
            entityType: 'CarePlanVersion',
            entityId: v.id,
            afterData: { versionNo: v.versionNo, level: v.level, status: v.status, babyProfileId: v.babyProfileId },
            remark: `第 ${v.versionNo} 版：${remark}`,
            tenantId: this.ctx.tenantId,
            storeId: v.storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
    }
};
exports.CarePlanVersionService = CarePlanVersionService;
exports.CarePlanVersionService = CarePlanVersionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CarePlanVersionService);
let CareServiceLogService = class CareServiceLogService {
    prisma;
    auditLogService;
    ctx;
    plans;
    constructor(prisma, auditLogService, ctx, plans) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
        this.plans = plans;
    }
    async mother(id) {
        const m = await this.prisma.motherProfile.findFirst({
            where: { id, tenantId: this.ctx.tenantId },
            include: { babies: { orderBy: { sequenceNo: 'asc' } }, occupancy: { select: { plannedCheckIn: true, plannedCheckOut: true, actualCheckInAt: true, actualCheckOutAt: true } } },
        });
        if (!m)
            throw new common_1.NotFoundException('母婴档案不存在');
        return m;
    }
    async summary(motherProfileId) {
        const m = await this.mother(motherProfileId);
        const o = m.occupancy;
        const startRaw = o?.actualCheckInAt ?? o?.plannedCheckIn ?? m.createdAt;
        const start = new Date(`${new Date(startRaw.getTime() + 8 * 3600_000).toISOString().slice(0, 10)}T00:00:00.000Z`);
        const outRaw = o?.actualCheckOutAt;
        const end = outRaw ? new Date(`${new Date(outRaw.getTime() + 8 * 3600_000).toISOString().slice(0, 10)}T00:00:00.000Z`) : beijingToday();
        const stayDay = Math.max(1, Math.round((Math.min(end.getTime(), beijingToday().getTime()) - start.getTime()) / DAY_MS) + 1);
        const plans = await this.prisma.carePlanVersion.findMany({ where: { tenantId: this.ctx.tenantId, motherProfileId, status: 'ACTIVE' } });
        const motherLevel = (plans.find((p) => !p.babyProfileId)?.level ?? 'LEVEL3');
        const levelOf = (babyId) => (babyId ? (plans.find((p) => p.babyProfileId === babyId)?.level ?? motherLevel) : motherLevel);
        const logs = await this.prisma.careServiceLog.findMany({ where: { tenantId: this.ctx.tenantId, motherProfileId }, orderBy: [{ doneDate: 'asc' }, { createdAt: 'asc' }] });
        const rows = [];
        const push = (std, babyId, babyLabel) => {
            const level = levelOf(babyId);
            const stdAtLevel = care_standards_1.LEVEL_STANDARDS[level].services.find((s) => s.code === std.code) ?? std;
            const mine = logs.filter((l) => l.serviceCode === std.code && (l.babyProfileId ?? null) === babyId);
            rows.push({
                code: std.code,
                name: std.name,
                subject: std.subject,
                group: std.group,
                level,
                babyProfileId: babyId,
                babyLabel,
                freqText: (0, care_standards_1.freqText)(stdAtLevel.freq),
                expected: (0, care_standards_1.expectedCount)(stdAtLevel.freq, stayDay),
                done: mine.length,
                measure: care_standards_1.SERVICE_MEASURE[std.code] ?? null,
                logs: mine.map((l) => ({
                    id: l.id,
                    date: ymd(l.doneDate),
                    time: l.doneTime,
                    systolic: l.systolic,
                    diastolic: l.diastolic,
                    heartRate: l.heartRate,
                    weightKg: l.weightKg === null ? null : Number(l.weightKg),
                    doneByName: l.doneByName,
                    clientSigned: l.clientSigned,
                    note: l.note,
                })),
            });
        };
        for (const std of care_standards_1.LEVEL_STANDARDS.LEVEL3.services) {
            if (std.subject === 'MOTHER')
                push(std, null, null);
            else
                for (const b of m.babies)
                    push(std, b.id, `宝宝${b.sequenceNo}${b.name ? '：' + b.name : ''}`);
        }
        return { motherProfileId, stayDay, startDate: ymd(start), motherLevel, rows };
    }
    async create(dto) {
        const m = await this.mother(dto.motherProfileId);
        const std = care_standards_1.LEVEL_STANDARDS.LEVEL3.services.find((s) => s.code === dto.serviceCode);
        if (!std || !(0, care_standards_1.allServiceCodes)().has(dto.serviceCode))
            throw new common_1.BadRequestException('未知的服务项目');
        if (std.subject === 'BABY') {
            if (!dto.babyProfileId || !m.babies.some((b) => b.id === dto.babyProfileId))
                throw new common_1.BadRequestException('请选择是哪个宝宝');
        }
        else if (dto.babyProfileId)
            throw new common_1.BadRequestException('这是妈妈的服务项目，不要选宝宝');
        const day = dto.doneDate ? dto.doneDate.slice(0, 10) : ymd(beijingToday());
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(new Date(day).getTime()))
            throw new common_1.BadRequestException('日期格式不正确');
        if (day > ymd(beijingToday()))
            throw new common_1.BadRequestException('不能记录未来的日期');
        const time = dto.doneTime?.trim() || null;
        if (!time)
            throw new common_1.BadRequestException('请填写做的时间');
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
            throw new common_1.BadRequestException('时间格式不正确，应为 HH:mm');
        if (day === ymd(beijingToday()) && time > new Date(Date.now() + 8 * 3600_000).toISOString().slice(11, 16))
            throw new common_1.BadRequestException('不能记录未来的时间');
        const measure = care_standards_1.SERVICE_MEASURE[std.code];
        let systolic = null;
        let diastolic = null;
        let heartRate = null;
        let weightKg = null;
        if (measure === 'BP') {
            systolic = dto.systolic ?? null;
            diastolic = dto.diastolic ?? null;
            if (systolic === null || diastolic === null)
                throw new common_1.BadRequestException('请填写收缩压和舒张压');
            if (systolic < 60 || systolic > 260)
                throw new common_1.BadRequestException('收缩压应在 60~260 mmHg 之间');
            if (diastolic < 30 || diastolic > 160)
                throw new common_1.BadRequestException('舒张压应在 30~160 mmHg 之间');
            if (diastolic >= systolic)
                throw new common_1.BadRequestException('舒张压应低于收缩压，请检查是否填反');
            heartRate = dto.heartRate ?? null;
            if (heartRate !== null && (heartRate < 30 || heartRate > 220))
                throw new common_1.BadRequestException('心率应在 30~220 次/分之间');
        }
        else if (measure === 'WEIGHT') {
            weightKg = dto.weightKg ?? null;
            if (weightKg === null)
                throw new common_1.BadRequestException('请填写体重');
            if (weightKg < 30 || weightKg > 200)
                throw new common_1.BadRequestException('体重应在 30~200 kg 之间');
            weightKg = Math.round(weightKg * 100) / 100;
        }
        if (std.freq.kind === 'ONCE') {
            const dup = await this.prisma.careServiceLog.count({ where: { motherProfileId: m.id, serviceCode: std.code, babyProfileId: dto.babyProfileId ?? null } });
            if (dup > 0)
                throw new common_1.ConflictException('这个宣教项目已经记录过了（入住期间只需 1 次）');
        }
        const created = await this.prisma.careServiceLog.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: m.storeId,
                motherProfileId: m.id,
                babyProfileId: dto.babyProfileId ?? null,
                serviceCode: std.code,
                doneDate: new Date(`${day}T00:00:00.000Z`),
                doneTime: time,
                systolic,
                diastolic,
                heartRate,
                weightKg,
                doneByName: dto.doneByName?.trim() || null,
                clientSigned: !!dto.clientSigned,
                note: dto.note?.trim() || null,
                createdBy: this.ctx.accountId,
            },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CareServiceLog',
            entityId: created.id,
            afterData: { serviceCode: std.code, doneDate: day, doneTime: time, systolic, diastolic, heartRate, weightKg },
            remark: `${std.name} ${day} ${time}`,
            tenantId: this.ctx.tenantId,
            storeId: m.storeId,
            accountId: this.ctx.accountId,
            requestId: this.ctx.requestId,
        });
        return created;
    }
    async toggleDay(dto) {
        const m = await this.mother(dto.motherProfileId);
        const std = care_standards_1.LEVEL_STANDARDS.LEVEL3.services.find((s) => s.code === dto.serviceCode);
        if (!std || std.group !== 'ITEM' || care_standards_1.SERVICE_MEASURE[std.code])
            throw new common_1.BadRequestException('这个项目不支持按日期打卡（宣教和测量类项目请用“记一次”）');
        if (std.subject === 'BABY') {
            if (!dto.babyProfileId || !m.babies.some((b) => b.id === dto.babyProfileId))
                throw new common_1.BadRequestException('请选择是哪个宝宝');
        }
        const day = String(dto.date ?? '').slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(new Date(day).getTime()))
            throw new common_1.BadRequestException('日期格式不正确');
        if (day > ymd(beijingToday()))
            throw new common_1.BadRequestException('不能记录未来的日期');
        const where = { tenantId: this.ctx.tenantId, motherProfileId: m.id, serviceCode: std.code, babyProfileId: std.subject === 'BABY' ? dto.babyProfileId : null, doneDate: new Date(`${day}T00:00:00.000Z`) };
        const existing = await this.prisma.careServiceLog.count({ where });
        if (dto.done) {
            if (existing > 0)
                return { count: existing };
            const me = await this.prisma.account.findUnique({ where: { id: this.ctx.accountId }, select: { realName: true } });
            await this.prisma.careServiceLog.create({ data: { ...where, storeId: m.storeId, doneByName: me?.realName ?? null, createdBy: this.ctx.accountId } });
        }
        else if (existing > 0) {
            await this.prisma.careServiceLog.deleteMany({ where });
        }
        await this.auditLogService.record({
            action: dto.done ? 'CREATE' : 'DELETE',
            entityType: 'CareServiceLog',
            entityId: m.id,
            remark: `${std.name} ${day} ${dto.done ? '标记已执行' : '取消执行'}`,
            tenantId: this.ctx.tenantId,
            storeId: m.storeId,
            accountId: this.ctx.accountId,
            requestId: this.ctx.requestId,
        });
        return { count: dto.done ? 1 : 0 };
    }
    async importPreview(documentId, babyProfileId) {
        const doc = await this.prisma.careDocument.findFirst({ where: { id: documentId, tenantId: this.ctx.tenantId } });
        if (!doc || doc.docType !== 'CARE_PLAN')
            throw new common_1.NotFoundException('没有找到这份护理计划表照片');
        if (doc.extractStatus !== 'DONE' || !doc.extractData)
            throw new common_1.ConflictException('这份照片还没有识别完成');
        const m = await this.mother(doc.motherProfileId);
        const baby = (babyProfileId ?? doc.babyProfileId) ? m.babies.find((b) => b.id === (babyProfileId ?? doc.babyProfileId)) : m.babies[0];
        const data = doc.extractData;
        const entries = Array.isArray(data.entries) ? data.entries : [];
        const uncertain = new Set();
        for (const w of doc.extractWarnings ?? []) {
            const mm = /^entries\.(\d+)\./.exec(w.field ?? '');
            if (mm && w.level !== 'info')
                uncertain.add(Number(mm[1]));
        }
        const customer = await this.prisma.customer.findFirst({ where: { id: m.customerId }, select: { name: true } });
        const existing = await this.prisma.careServiceLog.findMany({ where: { tenantId: this.ctx.tenantId, motherProfileId: m.id }, select: { serviceCode: true, babyProfileId: true, doneDate: true } });
        const exCount = new Map();
        for (const l of existing) {
            const k = `${l.serviceCode}|${l.babyProfileId ?? ''}|${ymd(l.doneDate)}`;
            exCount.set(k, (exCount.get(k) ?? 0) + 1);
        }
        const hasAny = (code, babyId) => existing.some((l) => l.serviceCode === code && (l.babyProfileId ?? '') === babyId);
        const today = ymd(beijingToday());
        const seen = new Map();
        let planned = 0;
        const isPlanned = (e) => {
            const code = String(e.serviceCode ?? '');
            if (code === 'BP')
                return e.systolic == null && e.diastolic == null;
            if (code === 'WEIGHT')
                return e.weightKg == null;
            return false;
        };
        const buildItem = (e, idx) => {
            const code = String(e.serviceCode ?? '');
            const std = care_standards_1.LEVEL_STANDARDS.LEVEL3.services.find((s) => s.code === code);
            const date = typeof e.date === 'string' ? e.date.slice(0, 10) : '';
            const base = {
                idx,
                serviceCode: code,
                name: std ? std.name : code,
                sheetLabel: (0, service_sheet_specs_1.sheetRowLabel)(code),
                group: std?.group ?? 'ITEM',
                subject: std?.subject ?? 'MOTHER',
                date,
                time: typeof e.time === 'string' && /^([01]?\d|2[0-3]):[0-5]\d$/.test(e.time) ? e.time.padStart(5, '0') : null,
                systolic: typeof e.systolic === 'number' ? e.systolic : null,
                diastolic: typeof e.diastolic === 'number' ? e.diastolic : null,
                heartRate: typeof e.heartRate === 'number' ? e.heartRate : null,
                weightKg: typeof e.weightKg === 'number' ? e.weightKg : null,
                doneByName: typeof e.doneByName === 'string' ? e.doneByName : null,
                clientSigned: e.clientSigned === 'YES' || e.clientSigned === true,
                uncertain: uncertain.has(idx),
            };
            const bid = std?.subject === 'BABY' ? (baby?.id ?? '') : '';
            let status = 'NEW';
            let issue;
            if (!std) {
                status = 'INVALID';
                issue = '不认识的项目';
            }
            else if (std.subject === 'BABY' && !baby) {
                status = 'INVALID';
                issue = '这是宝宝的项目，但这位妈妈还没有宝宝档案';
            }
            else if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
                status = 'INVALID';
                issue = '日期没读出来，请在这里补上日期';
            }
            else {
                const v = this.validateMeasure(code, base.systolic, base.diastolic, base.weightKg);
                if (v) {
                    status = 'INVALID';
                    issue = v;
                }
                else if (std.freq.kind === 'ONCE' ? hasAny(code, bid) || (seen.get(`${code}|${bid}`) ?? 0) > 0 : false) {
                    status = 'EXISTS';
                }
                else if (std.freq.kind !== 'ONCE') {
                    const k = `${code}|${bid}|${date}`;
                    const n = (seen.get(k) ?? 0) + 1;
                    seen.set(k, n);
                    if (n <= (exCount.get(k) ?? 0))
                        status = 'EXISTS';
                    else if (date > today) {
                        status = 'INVALID';
                        issue = '日期是未来，请核对';
                    }
                }
                if (std.freq.kind === 'ONCE' && status === 'NEW')
                    seen.set(`${code}|${bid}`, 1);
            }
            return { ...base, status, issue };
        };
        const items = entries.flatMap((e, idx) => {
            if (isPlanned(e)) {
                planned++;
                return [];
            }
            return [buildItem(e, idx)];
        });
        return {
            documentId: doc.id,
            motherProfileId: m.id,
            babyProfileId: baby?.id ?? null,
            babies: m.babies.map((b) => ({ id: b.id, label: `宝宝${b.sequenceNo}${b.name ? '：' + b.name : ''}` })),
            header: {
                patientName: data.patientName ?? null,
                customerName: customer?.name ?? null,
                nameMatches: !data.patientName || !customer?.name ? null : data.patientName.replace(/\s/g, '') === customer.name.replace(/\s/g, ''),
                checkInDate: data.checkInDate ?? null,
            },
            counts: { total: items.length, planned, new: items.filter((i) => i.status === 'NEW').length, exists: items.filter((i) => i.status === 'EXISTS').length, invalid: items.filter((i) => i.status === 'INVALID').length },
            items,
        };
    }
    validateMeasure(code, systolic, diastolic, weightKg) {
        const measure = care_standards_1.SERVICE_MEASURE[code];
        if (measure === 'BP') {
            if (systolic === null || diastolic === null)
                return '血压没读全（需要高压和低压）';
            if (systolic < 60 || systolic > 260 || diastolic < 30 || diastolic > 160 || diastolic >= systolic)
                return '血压数值不合理，请核对';
        }
        else if (measure === 'WEIGHT') {
            if (weightKg === null)
                return '体重没读出来';
            if (weightKg < 30 || weightKg > 200)
                return '体重数值不合理，请核对';
        }
        return null;
    }
    async importCommit(input) {
        const doc = await this.prisma.careDocument.findFirst({ where: { id: input.documentId, tenantId: this.ctx.tenantId } });
        if (!doc || doc.docType !== 'CARE_PLAN')
            throw new common_1.NotFoundException('没有找到这份护理计划表照片');
        const m = await this.mother(doc.motherProfileId);
        const baby = input.babyProfileId ? m.babies.find((b) => b.id === input.babyProfileId) : m.babies[0];
        if (!Array.isArray(input.items) || input.items.length === 0)
            throw new common_1.BadRequestException('没有要登记的记录');
        if (input.items.length > 300)
            throw new common_1.BadRequestException('一次最多登记 300 条');
        const today = ymd(beijingToday());
        const existing = await this.prisma.careServiceLog.findMany({ where: { tenantId: this.ctx.tenantId, motherProfileId: m.id }, select: { serviceCode: true, babyProfileId: true, doneDate: true } });
        const exCount = new Map();
        for (const l of existing) {
            const k = `${l.serviceCode}|${l.babyProfileId ?? ''}|${ymd(l.doneDate)}`;
            exCount.set(k, (exCount.get(k) ?? 0) + 1);
        }
        const hasAny = (code, bid) => existing.some((l) => l.serviceCode === code && (l.babyProfileId ?? '') === bid);
        const used = new Map();
        const rows = [];
        let skipped = 0;
        for (const [i, it] of input.items.entries()) {
            const std = care_standards_1.LEVEL_STANDARDS.LEVEL3.services.find((s) => s.code === it.serviceCode);
            if (!std)
                throw new common_1.BadRequestException(`第 ${i + 1} 条：未知的服务项目`);
            if (std.subject === 'BABY' && !baby)
                throw new common_1.BadRequestException(`第 ${i + 1} 条（${std.name}）是宝宝的项目，但还没有宝宝档案`);
            const date = String(it.date ?? '').slice(0, 10);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime()))
                throw new common_1.BadRequestException(`第 ${i + 1} 条（${std.name}）日期不正确`);
            if (date > today)
                throw new common_1.BadRequestException(`第 ${i + 1} 条（${std.name}）日期 ${date} 是未来，不能登记`);
            const bad = this.validateMeasure(std.code, it.systolic ?? null, it.diastolic ?? null, it.weightKg ?? null);
            if (bad)
                throw new common_1.BadRequestException(`第 ${i + 1} 条（${std.name}）：${bad}`);
            const bid = std.subject === 'BABY' ? (baby?.id ?? '') : '';
            if (std.freq.kind === 'ONCE') {
                if (hasAny(std.code, bid) || used.has(`${std.code}|${bid}`)) {
                    skipped++;
                    continue;
                }
                used.set(`${std.code}|${bid}`, 1);
            }
            else {
                const k = `${std.code}|${bid}|${date}`;
                const n = (used.get(k) ?? 0) + 1;
                used.set(k, n);
                if (n <= (exCount.get(k) ?? 0)) {
                    skipped++;
                    continue;
                }
            }
            const time = it.time && /^([01]?\d|2[0-3]):[0-5]\d$/.test(it.time) ? it.time.padStart(5, '0') : null;
            rows.push({
                tenantId: this.ctx.tenantId,
                storeId: m.storeId,
                motherProfileId: m.id,
                babyProfileId: std.subject === 'BABY' ? baby.id : null,
                serviceCode: std.code,
                doneDate: new Date(`${date}T00:00:00.000Z`),
                doneTime: time,
                systolic: care_standards_1.SERVICE_MEASURE[std.code] === 'BP' ? (it.systolic ?? null) : null,
                diastolic: care_standards_1.SERVICE_MEASURE[std.code] === 'BP' ? (it.diastolic ?? null) : null,
                heartRate: care_standards_1.SERVICE_MEASURE[std.code] === 'BP' && it.heartRate != null && it.heartRate >= 30 && it.heartRate <= 220 ? it.heartRate : null,
                weightKg: care_standards_1.SERVICE_MEASURE[std.code] === 'WEIGHT' && it.weightKg != null ? Math.round(it.weightKg * 100) / 100 : null,
                doneByName: it.doneByName?.trim() || null,
                clientSigned: !!it.clientSigned,
                note: '纸质表拍照识别登记',
                createdBy: this.ctx.accountId,
            });
        }
        await this.prisma.$transaction(async (tx) => {
            if (rows.length > 0)
                await tx.careServiceLog.createMany({ data: rows });
            await tx.careDocument.update({ where: { id: doc.id }, data: { status: 'CONFIRMED', confirmedBy: this.ctx.accountId, confirmedAt: new Date(), version: { increment: 1 } } });
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CareServiceLog',
            entityId: doc.id,
            afterData: { fromDocument: doc.id, created: rows.length, skipped },
            remark: `拍照导入纸质护理计划表：新登记 ${rows.length} 条，已有跳过 ${skipped} 条（${rows.slice(0, 5).map((r) => (0, service_sheet_specs_1.serviceNameOf)(r.serviceCode)).join('、')}${rows.length > 5 ? '…' : ''}）`,
            tenantId: this.ctx.tenantId,
            storeId: m.storeId,
            accountId: this.ctx.accountId,
            requestId: this.ctx.requestId,
        });
        return { created: rows.length, skipped };
    }
    async remove(id) {
        const log = await this.prisma.careServiceLog.findFirst({ where: { id, tenantId: this.ctx.tenantId } });
        if (!log)
            throw new common_1.NotFoundException('记录不存在');
        await this.prisma.careServiceLog.delete({ where: { id } });
        await this.auditLogService.record({
            action: 'DELETE',
            entityType: 'CareServiceLog',
            entityId: id,
            beforeData: { serviceCode: log.serviceCode, doneDate: ymd(log.doneDate) },
            tenantId: this.ctx.tenantId,
            storeId: log.storeId,
            accountId: this.ctx.accountId,
            requestId: this.ctx.requestId,
        });
    }
    get planService() {
        return this.plans;
    }
};
exports.CareServiceLogService = CareServiceLogService;
exports.CareServiceLogService = CareServiceLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService,
        CarePlanVersionService])
], CareServiceLogService);
//# sourceMappingURL=care-plan-version.service.js.map