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
exports.CareDailyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const assessment_codec_1 = require("../care-assessment/assessment-codec");
const care_medication_service_1 = require("../care-medication/care-medication.service");
const daily_specs_1 = require("./daily-specs");
const DAY_MS = 86_400_000;
const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;
const motherSpec = { groups: daily_specs_1.DAILY_MOTHER_FIELDS };
const babySpec = { groups: daily_specs_1.DAILY_BABY_FIELDS };
const nursingSpec = { groups: [{ title: '护理', fields: daily_specs_1.NURSING_COLUMNS }] };
const feedingSpec = { groups: [{ title: '喂养', fields: daily_specs_1.FEEDING_COLUMNS }] };
const ymd = (d) => d.toISOString().slice(0, 10);
const utcDay = (s) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s))
        throw new common_1.BadRequestException('日期格式应为 YYYY-MM-DD');
    const d = new Date(`${s}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime()))
        throw new common_1.BadRequestException('日期不存在');
    return d;
};
const todayUtc = () => utcDay(new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10));
let CareDailyService = class CareDailyService {
    prisma;
    auditLogService;
    ctx;
    medication;
    constructor(prisma, auditLogService, ctx, medication) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
        this.medication = medication;
    }
    specs() {
        return { mother: daily_specs_1.DAILY_MOTHER_FIELDS, baby: daily_specs_1.DAILY_BABY_FIELDS, feeding: daily_specs_1.FEEDING_COLUMNS, nursing: daily_specs_1.NURSING_COLUMNS };
    }
    async mother(id) {
        const m = await this.prisma.motherProfile.findFirst({
            where: { id, tenantId: this.ctx.tenantId },
            include: {
                customer: { select: { name: true } },
                babies: { orderBy: { sequenceNo: 'asc' } },
                occupancy: { select: { plannedCheckIn: true, plannedCheckOut: true, actualCheckInAt: true, actualCheckOutAt: true, room: { select: { roomNo: true } } } },
            },
        });
        if (!m)
            throw new common_1.NotFoundException('母婴档案不存在');
        return m;
    }
    startDate(m) {
        const o = m.occupancy;
        const raw = o?.actualCheckInAt ?? o?.plannedCheckIn ?? m.createdAt;
        return utcDay(new Date(raw.getTime() + 8 * 3600_000).toISOString().slice(0, 10));
    }
    endDate(m, start) {
        const today = todayUtc();
        const o = m.occupancy;
        const out = o?.actualCheckOutAt ?? o?.plannedCheckOut;
        let end = today;
        if (out) {
            const outDay = utcDay(new Date(out.getTime() + 8 * 3600_000).toISOString().slice(0, 10));
            if (outDay.getTime() < today.getTime())
                end = outDay;
        }
        return end.getTime() < start.getTime() ? start : end;
    }
    async days(motherProfileId) {
        const m = await this.mother(motherProfileId);
        const start = this.startDate(m);
        const end = this.endDate(m, start);
        const records = await this.prisma.careDailyRecord.findMany({
            where: { motherProfileId },
            select: { id: true, recordDate: true, babies: { select: { babyProfileId: true } } },
        });
        const byDate = new Map(records.map((r) => [ymd(r.recordDate), r]));
        const dates = new Set();
        for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS)
            dates.add(ymd(new Date(t)));
        for (const k of byDate.keys())
            dates.add(k);
        const sorted = [...dates].sort().reverse();
        return {
            motherProfileId,
            roomNo: m.occupancy?.room?.roomNo ?? null,
            startDate: ymd(start),
            today: ymd(todayUtc()),
            babyCount: m.babies.length,
            days: sorted.map((date) => {
                const r = byDate.get(date);
                return {
                    date,
                    stayDay: Math.round((utcDay(date).getTime() - start.getTime()) / DAY_MS) + 1,
                    filled: !!r,
                    babiesFilled: r ? r.babies.length : 0,
                };
            }),
        };
    }
    babySummary(feedings) {
        const sum = (k) => feedings.reduce((a, f) => a + (f[k] ?? 0), 0);
        return {
            formulaTotalMl: sum('formulaMl'),
            breastMilkTotalMl: sum('breastMilkMl'),
            waterTotalMl: sum('waterMl'),
            urineCount: feedings.filter((f) => f.urine === 'YES').length,
            stoolCount: feedings.filter((f) => f.stool === 'YES').length,
            feedCount: feedings.filter((f) => (f.formulaMl ?? 0) + (f.breastMilkMl ?? 0) > 0).length,
        };
    }
    async day(motherProfileId, date) {
        const m = await this.mother(motherProfileId);
        const d = utcDay(date);
        const start = this.startDate(m);
        const record = await this.prisma.careDailyRecord.findUnique({
            where: { motherProfileId_recordDate: { motherProfileId, recordDate: d } },
            include: { babies: { include: { feedings: { orderBy: [{ time: 'asc' }, { sortOrder: 'asc' }] }, nursings: { orderBy: [{ time: 'asc' }, { sortOrder: 'asc' }] } } }, document: { select: { id: true } } },
        });
        const stayDay = Math.round((d.getTime() - start.getTime()) / DAY_MS) + 1;
        const activeMeds = await this.medication.activeItems(m.babies.map((b) => b.id), date);
        return {
            motherProfileId,
            date,
            roomNo: m.occupancy?.room?.roomNo ?? null,
            motherName: m.customer?.name ?? null,
            defaults: { stayDay },
            record: record ? { ...record, babies: undefined } : null,
            babies: m.babies.map((b) => {
                const br = record?.babies.find((x) => x.babyProfileId === b.id) ?? null;
                const ageDays = b.birthDate ? Math.round((d.getTime() - utcDay(ymd(b.birthDate)).getTime()) / DAY_MS) : null;
                return {
                    baby: { id: b.id, sequenceNo: b.sequenceNo, name: b.name, gender: b.gender, birthDate: b.birthDate },
                    defaultAgeDays: ageDays !== null && ageDays >= 0 ? ageDays : null,
                    record: br ? { ...br, feedings: undefined, nursings: undefined } : null,
                    feedings: br?.feedings ?? [],
                    nursings: br?.nursings ?? [],
                    summary: this.babySummary(br?.feedings ?? []),
                    activeMedications: activeMeds[b.id] ?? [],
                };
            }),
        };
    }
    async saveDay(dto) {
        const m = await this.mother(dto.motherProfileId);
        const d = utcDay(dto.date);
        const start = this.startDate(m);
        const motherData = (0, assessment_codec_1.toDbData)(motherSpec, dto.mother ?? {});
        const babyIds = new Set(m.babies.map((b) => b.id));
        const babyData = (dto.babies ?? []).map((b) => {
            if (!babyIds.has(b.babyProfileId))
                throw new common_1.BadRequestException('宝宝不属于这个母婴档案');
            const feedings = (b.feedings ?? []).map((f, i) => {
                const data = (0, assessment_codec_1.toDbData)(feedingSpec, f);
                if (data.time && !TIME_RE.test(String(data.time))) {
                    const m = String(data.time).match(/(\d{1,2})\s*[:：.]\s*(\d{2})/);
                    if (m) {
                        const raw = String(data.time);
                        data.time = `${m[1].padStart(2, '0')}:${m[2]}`;
                        data.remark = [data.remark, `时间：${raw}`].filter(Boolean).join('；');
                    }
                }
                if (data.time && !TIME_RE.test(String(data.time)))
                    throw new common_1.BadRequestException(`第 ${i + 1} 行喂养记录的时间「${data.time}」格式不对，应为 HH:mm（如 14:20）`);
                if (!data.time)
                    throw new common_1.BadRequestException(`第 ${i + 1} 行喂养记录没有填时间`);
                const t = String(data.time);
                return { ...data, time: t.length === 4 ? `0${t}` : t, sortOrder: i };
            });
            const nursings = b.nursings === undefined ? null : b.nursings.map((n, i) => {
                const data = (0, assessment_codec_1.toDbData)(nursingSpec, n);
                if (!data.time || !TIME_RE.test(String(data.time)))
                    throw new common_1.BadRequestException(`第 ${i + 1} 行护理记录的时间格式不对，应为 HH:mm（如 08:30）`);
                const t = String(data.time);
                return { ...data, time: t.length === 4 ? `0${t}` : t, sortOrder: i };
            });
            return { babyProfileId: b.babyProfileId, data: (0, assessment_codec_1.toDbData)(babySpec, b.values ?? {}), feedings, nursings };
        });
        if (dto.documentId) {
            const doc = await this.prisma.careDocument.findFirst({ where: { id: dto.documentId, tenantId: this.ctx.tenantId, motherProfileId: dto.motherProfileId } });
            if (!doc || doc.docType !== 'DAILY_RECORD')
                throw new common_1.BadRequestException('关联的纸质资料不存在或类型不是日常护理记录');
        }
        const existing = await this.prisma.careDailyRecord.findUnique({
            where: { motherProfileId_recordDate: { motherProfileId: dto.motherProfileId, recordDate: d } },
            include: { babies: true },
        });
        if (existing && dto.version !== existing.version)
            throw new common_1.ConflictException('这一天的记录已被他人修改，请刷新后重试');
        if (!existing && dto.version !== undefined && dto.version !== null)
            throw new common_1.ConflictException('这一天的记录不存在，请刷新后重试');
        const stayDay = Math.round((d.getTime() - start.getTime()) / DAY_MS) + 1;
        const tenantId = this.ctx.tenantId;
        const accountId = this.ctx.accountId;
        const saved = await this.prisma.$transaction(async (tx) => {
            const record = existing
                ? await tx.careDailyRecord.update({
                    where: { id: existing.id, version: existing.version },
                    data: { ...motherData, ...(dto.documentId !== undefined ? { documentId: dto.documentId } : {}), version: { increment: 1 } },
                })
                : await tx.careDailyRecord.create({
                    data: { ...motherData, tenantId, storeId: m.storeId, motherProfileId: m.id, recordDate: d, stayDay, documentId: dto.documentId ?? null, createdBy: accountId },
                });
            for (const b of babyData) {
                const prev = existing?.babies.find((x) => x.babyProfileId === b.babyProfileId);
                const br = prev
                    ? await tx.careDailyBabyRecord.update({ where: { id: prev.id }, data: { ...b.data, ...(dto.documentId !== undefined ? { documentId: dto.documentId } : {}), version: { increment: 1 } } })
                    : await tx.careDailyBabyRecord.create({
                        data: { ...b.data, tenantId, storeId: m.storeId, dailyRecordId: record.id, babyProfileId: b.babyProfileId, documentId: dto.documentId ?? null, createdBy: accountId },
                    });
                await tx.careFeedingEntry.deleteMany({ where: { babyDailyId: br.id } });
                if (b.feedings.length > 0) {
                    await tx.careFeedingEntry.createMany({ data: b.feedings.map((f) => ({ ...f, tenantId, babyDailyId: br.id })) });
                }
                if (b.nursings) {
                    await tx.careNursingEntry.deleteMany({ where: { babyDailyId: br.id } });
                    if (b.nursings.length > 0) {
                        await tx.careNursingEntry.createMany({ data: b.nursings.map((n) => ({ ...n, tenantId, babyDailyId: br.id })) });
                    }
                }
            }
            return record;
        });
        if (dto.documentId) {
            await this.prisma.careDocument.updateMany({
                where: { id: dto.documentId, tenantId, status: 'DRAFT' },
                data: { status: 'CONFIRMED', confirmedBy: accountId, confirmedAt: new Date() },
            });
        }
        await this.auditLogService.record({
            action: existing ? 'UPDATE' : 'CREATE',
            entityType: 'CareDailyRecord',
            entityId: saved.id,
            afterData: { date: dto.date, motherProfileId: m.id, babies: babyData.length, feedings: babyData.reduce((a, b) => a + b.feedings.length, 0) },
            remark: `日常护理记录 ${dto.date}`,
            tenantId,
            storeId: m.storeId,
            accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return this.day(dto.motherProfileId, dto.date);
    }
    async pending(storeId, date) {
        const d = date ? utcDay(date) : todayUtc();
        const profiles = await this.prisma.motherProfile.findMany({
            where: { tenantId: this.ctx.tenantId, storeId, occupancy: { status: 'CHECKED_IN' } },
            select: { id: true, customer: { select: { name: true } }, occupancy: { select: { room: { select: { roomNo: true } } } }, dailyRecords: { where: { recordDate: d }, select: { id: true } } },
        });
        return profiles
            .filter((p) => p.dailyRecords.length === 0)
            .map((p) => ({ motherProfileId: p.id, customerName: p.customer.name, roomNo: p.occupancy?.room?.roomNo ?? null }));
    }
};
exports.CareDailyService = CareDailyService;
exports.CareDailyService = CareDailyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService,
        care_medication_service_1.CareMedicationService])
], CareDailyService);
//# sourceMappingURL=care-daily.service.js.map