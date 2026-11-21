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
exports.CareGrowthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const signature_util_1 = require("../care-signature/signature.util");
const growth_util_1 = require("./growth.util");
const MAX_MONTHS = 3;
const DAY_MS = 86_400_000;
const SHARE_TTL_DAYS = 90;
const METRICS = ['weight', 'length', 'head'];
const ymd = (d) => d.toISOString().slice(0, 10);
const today = () => new Date(`${new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10)}T00:00:00.000Z`);
const RANGE = { weight: [500, 20000], length: [25, 120], head: [20, 60] };
let CareGrowthService = class CareGrowthService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    async baby(id) {
        const b = await this.prisma.babyProfile.findFirst({ where: { id, tenantId: this.ctx.tenantId }, include: { motherProfile: { select: { id: true, storeId: true, gestationalWeeks: true } } } });
        if (!b)
            throw new common_1.NotFoundException('宝宝档案不存在');
        return b;
    }
    async buildReport(babyId, tenantId, standardRaw) {
        const standard = (0, growth_util_1.parseStandard)(standardRaw);
        const b = await this.prisma.babyProfile.findFirst({ where: { id: babyId, tenantId }, include: { motherProfile: { select: { gestationalWeeks: true } } } });
        if (!b)
            throw new common_1.NotFoundException('宝宝档案不存在');
        const sex = b.gender === 'MALE' || b.gender === 'FEMALE' ? b.gender : null;
        const adm = await this.prisma.careBabyAdmission.findFirst({
            where: { tenantId, babyProfileId: babyId },
            select: { birthDate: true, birthWeightG: true, admissionDate: true, admissionWeightG: true, admissionLengthCm: true, headCircumferenceCm: true },
        });
        const birthRaw = b.birthDate ?? adm?.birthDate ?? null;
        const birthWeightG = b.birthWeightGrams ?? adm?.birthWeightG ?? null;
        const birth = birthRaw ? new Date(`${ymd(new Date(birthRaw.getTime() + 8 * 3600_000))}T00:00:00.000Z`) : null;
        const hints = [];
        if (adm && (adm.admissionWeightG != null || adm.admissionLengthCm != null || adm.headCircumferenceCm != null) && !adm.admissionDate) {
            hints.push('新生儿入所评估里填了入所体重/身长/头围，但没有填“入所日期”，这些数据没法画到曲线上（请到入所评估里补上入所日期）');
        }
        const ga = b.motherProfile.gestationalWeeks;
        const notReady = [];
        if (!sex)
            notReady.push('宝宝性别');
        if (!birth)
            notReady.push('出生日期');
        const growth = await this.prisma.babyGrowthRecord.findMany({ where: { tenantId, babyProfileId: babyId }, orderBy: { measuredAt: 'asc' } });
        const daily = await this.prisma.careDailyBabyRecord.findMany({
            where: { tenantId, babyProfileId: babyId, OR: [{ weightG: { not: null } }, { lengthCm: { not: null } }, { headCm: { not: null } }] },
            select: { weightG: true, lengthCm: true, headCm: true, dailyRecord: { select: { recordDate: true } } },
        });
        const raw = { weight: new Map(), length: new Map(), head: new Map() };
        if (birthWeightG && birth)
            raw.weight.set(ymd(birth), { value: Math.round(birthWeightG) / 1000, source: 'BIRTH' });
        if (adm?.admissionDate) {
            const k = ymd(adm.admissionDate);
            if (adm.admissionWeightG != null)
                raw.weight.set(k, { value: adm.admissionWeightG / 1000, source: 'ADMISSION' });
            if (adm.admissionLengthCm != null)
                raw.length.set(k, { value: adm.admissionLengthCm, source: 'ADMISSION' });
            if (adm.headCircumferenceCm != null)
                raw.head.set(k, { value: adm.headCircumferenceCm, source: 'ADMISSION' });
        }
        for (const d of daily) {
            const k = ymd(d.dailyRecord.recordDate);
            if (d.weightG != null)
                raw.weight.set(k, { value: d.weightG / 1000, source: 'DAILY' });
            if (d.lengthCm != null)
                raw.length.set(k, { value: d.lengthCm, source: 'DAILY' });
            if (d.headCm != null)
                raw.head.set(k, { value: d.headCm, source: 'DAILY' });
        }
        for (const g of growth) {
            const k = ymd(g.measuredAt);
            if (g.weightG != null)
                raw.weight.set(k, { value: g.weightG / 1000, source: 'GROWTH', recordId: g.id });
            if (g.lengthCm != null)
                raw.length.set(k, { value: g.lengthCm, source: 'GROWTH', recordId: g.id });
            if (g.headCm != null)
                raw.head.set(k, { value: g.headCm, source: 'GROWTH', recordId: g.id });
        }
        const tableDates = new Set([...raw.weight.keys(), ...raw.length.keys(), ...raw.head.keys()]);
        const growthByDate = new Map(growth.map((g) => [ymd(g.measuredAt), g]));
        const table = [...tableDates]
            .sort()
            .map((date) => {
            const w = raw.weight.get(date);
            const l = raw.length.get(date);
            const h = raw.head.get(date);
            const g = growthByDate.get(date);
            return {
                date,
                ageDays: birth ? Math.round((new Date(`${date}T00:00:00.000Z`).getTime() - birth.getTime()) / DAY_MS) : null,
                weightG: w ? Math.round(w.value * 1000) : null,
                lengthCm: l?.value ?? null,
                headCm: h?.value ?? null,
                sources: { weight: w?.source ?? null, length: l?.source ?? null, head: h?.source ?? null },
                recordId: g?.id ?? null,
                note: g?.note ?? null,
                editedByName: g?.measuredByName ?? null,
            };
        });
        const points = { weight: [], length: [], head: [] };
        for (const m of METRICS) {
            for (const [date, v] of [...raw[m].entries()].sort((x, y) => x[0].localeCompare(y[0]))) {
                const at = new Date(`${date}T00:00:00.000Z`);
                const age = birth ? (0, growth_util_1.ageInMonths)(birth, at, ga) : { months: null, days: 0, corrected: false };
                const row = sex && age.months !== null ? (0, growth_util_1.standardRow)(m, sex, age.months, standard) : null;
                const toOut = (x) => (m === 'weight' ? Math.round(x * 1000) : x);
                const outRow = row ? row.map(toOut) : null;
                const outVal = toOut(v.value);
                const d = outRow ? (0, growth_util_1.describeMetric)(m, outVal, outRow) : null;
                points[m].push({ date, ageDays: age.days, ageMonths: age.months === null ? null : Math.round(age.months * 100) / 100, value: outVal, source: v.source, recordId: v.recordId, rating: d?.rating ?? null, pctText: d?.pctText ?? null, row: outRow });
            }
        }
        const curves = { weight: null, length: null, head: null };
        if (sex) {
            const ageList = standard === 'WHO' ? [...Array.from({ length: 13 }, (_, i) => (i * 7) / growth_util_1.MONTH_DAYS), MAX_MONTHS] : Array.from({ length: MAX_MONTHS + 1 }, (_, i) => i);
            for (const m of METRICS) {
                const ages = [];
                const rows = [];
                for (const a of ageList) {
                    const r = (0, growth_util_1.standardRow)(m, sex, a, standard);
                    if (r) {
                        ages.push(Math.round(a * 1000) / 1000);
                        rows.push(m === 'weight' ? r.map((x) => Math.round(x * 1000)) : r);
                    }
                }
                curves[m] = { ages, rows };
            }
        }
        const latest = METRICS.map((m) => {
            const p = points[m].filter((x) => x.row).at(-1);
            if (!p || !p.row)
                return null;
            const d = (0, growth_util_1.describeMetric)(m, p.value, p.row);
            return { metric: m, name: growth_util_1.METRIC_LABEL[m].name, unit: growth_util_1.METRIC_LABEL[m].unit, date: p.date, value: p.value, ageMonths: p.ageMonths, rating: d.rating, pctText: d.pctText, text: d.text, p3: p.row[0], p50: p.row[3], p97: p.row[6] };
        }).filter((x) => x !== null);
        return {
            baby: { id: b.id, name: b.name, sequenceNo: b.sequenceNo, sex, birthDate: birth ? ymd(birth) : null, preterm: !!ga && ga < 37, gestationalWeeks: ga ?? null },
            ready: notReady.length === 0,
            notReady,
            hints,
            table,
            points,
            curves,
            latest,
            records: growth
                .slice()
                .reverse()
                .map((g) => ({ id: g.id, date: ymd(g.measuredAt), weightG: g.weightG, lengthCm: g.lengthCm, headCm: g.headCm, measuredByName: g.measuredByName, note: g.note })),
            standard,
            standardLabel: growth_util_1.STANDARD_INFO[standard].label,
            source: growth_util_1.STANDARD_INFO[standard].source,
            maxMonths: MAX_MONTHS,
            generatedAt: new Date().toISOString(),
        };
    }
    async report(babyId, standard) {
        await this.baby(babyId);
        return this.buildReport(babyId, this.ctx.tenantId, standard);
    }
    async addRecord(dto) {
        const b = await this.baby(dto.babyProfileId);
        const day = String(dto.measuredAt ?? '').slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(new Date(day).getTime()))
            throw new common_1.BadRequestException('测量日期格式不正确');
        if (day > ymd(today()))
            throw new common_1.BadRequestException('不能记录未来的日期');
        if (b.birthDate && day < ymd(new Date(b.birthDate.getTime() + 8 * 3600_000)))
            throw new common_1.BadRequestException('测量日期不能早于宝宝出生日期');
        const patch = {};
        if (dto.weightG !== undefined)
            patch.weightG = dto.weightG === null ? null : Math.round(dto.weightG);
        if (dto.lengthCm !== undefined)
            patch.lengthCm = dto.lengthCm;
        if (dto.headCm !== undefined)
            patch.headCm = dto.headCm;
        const check = { weight: patch.weightG, length: patch.lengthCm, head: patch.headCm };
        for (const m of METRICS) {
            const v = check[m];
            if (v != null && (v < RANGE[m][0] || v > RANGE[m][1]))
                throw new common_1.BadRequestException(`${growth_util_1.METRIC_LABEL[m].name}应在 ${RANGE[m][0]}~${RANGE[m][1]} ${growth_util_1.METRIC_LABEL[m].unit} 之间，请核对`);
        }
        const measuredAt = new Date(`${day}T00:00:00.000Z`);
        const existing = await this.prisma.babyGrowthRecord.findFirst({ where: { tenantId: this.ctx.tenantId, babyProfileId: b.id, measuredAt } });
        const merged = {
            weightG: patch.weightG !== undefined ? patch.weightG : (existing?.weightG ?? null),
            lengthCm: patch.lengthCm !== undefined ? patch.lengthCm : (existing?.lengthCm ?? null),
            headCm: patch.headCm !== undefined ? patch.headCm : (existing?.headCm ?? null),
        };
        const allEmpty = merged.weightG === null && merged.lengthCm === null && merged.headCm === null;
        if (allEmpty && !existing)
            throw new common_1.BadRequestException('体重、身长、头围至少填一项');
        const me = await this.prisma.account.findUnique({ where: { id: this.ctx.accountId }, select: { realName: true } });
        let result;
        if (existing && allEmpty) {
            await this.prisma.babyGrowthRecord.delete({ where: { id: existing.id } });
            result = existing;
        }
        else if (existing) {
            result = await this.prisma.babyGrowthRecord.update({ where: { id: existing.id }, data: { ...merged, note: dto.note !== undefined ? dto.note?.trim() || null : existing.note, measuredByName: me?.realName ?? existing.measuredByName } });
        }
        else {
            result = await this.prisma.babyGrowthRecord.create({
                data: { tenantId: this.ctx.tenantId, storeId: b.storeId, motherProfileId: b.motherProfileId, babyProfileId: b.id, measuredAt, ...merged, measuredByName: me?.realName ?? null, note: dto.note?.trim() || null, createdBy: this.ctx.accountId },
            });
        }
        await this.auditLogService.record({
            action: existing ? (allEmpty ? 'DELETE' : 'UPDATE') : 'CREATE',
            entityType: 'BabyGrowthRecord',
            entityId: result.id,
            beforeData: existing ? { day, weightG: existing.weightG, lengthCm: existing.lengthCm, headCm: existing.headCm } : undefined,
            afterData: { day, ...merged },
            remark: `修改宝宝生长数据 ${day}`,
            tenantId: this.ctx.tenantId,
            storeId: b.storeId,
            accountId: this.ctx.accountId,
            requestId: this.ctx.requestId,
        });
        return result;
    }
    async removeRecord(id) {
        const r = await this.prisma.babyGrowthRecord.findFirst({ where: { id, tenantId: this.ctx.tenantId } });
        if (!r)
            throw new common_1.NotFoundException('记录不存在');
        await this.prisma.babyGrowthRecord.delete({ where: { id } });
        await this.auditLogService.record({
            action: 'DELETE',
            entityType: 'BabyGrowthRecord',
            entityId: id,
            beforeData: { day: ymd(r.measuredAt), weightG: r.weightG, lengthCm: r.lengthCm, headCm: r.headCm },
            tenantId: this.ctx.tenantId,
            storeId: r.storeId,
            accountId: this.ctx.accountId,
            requestId: this.ctx.requestId,
        });
    }
    async createShare(babyId) {
        const b = await this.baby(babyId);
        await this.prisma.babyGrowthShare.updateMany({ where: { babyProfileId: b.id, revokedAt: null }, data: { revokedAt: new Date() } });
        const token = (0, signature_util_1.randomToken)(32);
        const expiresAt = new Date(Date.now() + SHARE_TTL_DAYS * DAY_MS);
        const link = await this.prisma.babyGrowthShare.create({ data: { tenantId: this.ctx.tenantId, babyProfileId: b.id, tokenHash: (0, signature_util_1.sha256)(token), expiresAt, createdBy: this.ctx.accountId } });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'BabyGrowthShare',
            entityId: link.id,
            remark: `生成宝宝生长曲线客户链接（${SHARE_TTL_DAYS} 天有效）`,
            tenantId: this.ctx.tenantId,
            storeId: b.storeId,
            accountId: this.ctx.accountId,
            requestId: this.ctx.requestId,
        });
        return { id: link.id, token, path: `/g/${token}`, expiresAt };
    }
    async revokeShares(babyId) {
        const b = await this.baby(babyId);
        const r = await this.prisma.babyGrowthShare.updateMany({ where: { babyProfileId: b.id, revokedAt: null }, data: { revokedAt: new Date() } });
        return { revoked: r.count };
    }
    async publicReport(token, standard) {
        const link = await this.prisma.babyGrowthShare.findUnique({ where: { tokenHash: (0, signature_util_1.sha256)(token ?? '') } });
        if (!link)
            throw new common_1.NotFoundException('链接无效，请联系月子中心重新发送');
        if (link.revokedAt)
            throw new common_1.GoneException('这个链接已经失效，请联系月子中心获取最新链接');
        if (link.expiresAt.getTime() < Date.now())
            throw new common_1.GoneException('链接已过期，请联系月子中心重新发送');
        await this.prisma.babyGrowthShare.update({ where: { id: link.id }, data: { openCount: { increment: 1 }, lastOpenedAt: new Date() } });
        return this.buildReport(link.babyProfileId, link.tenantId, standard);
    }
};
exports.CareGrowthService = CareGrowthService;
exports.CareGrowthService = CareGrowthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CareGrowthService);
void growth_util_1.rate;
//# sourceMappingURL=care-growth.service.js.map