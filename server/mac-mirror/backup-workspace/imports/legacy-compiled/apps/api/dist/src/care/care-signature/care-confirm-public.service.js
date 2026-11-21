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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareConfirmPublicService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const daily_specs_1 = require("../care-daily/daily-specs");
const care_standards_1 = require("../care-plan-version/care-standards");
const care_signature_service_1 = require("./care-signature.service");
const signature_util_1 = require("./signature.util");
const DAY_MS = 86_400_000;
const MAX_FAILED = 5;
const LOCK_MS = 30 * 60_000;
const SESSION_MS = 60 * 60_000;
const VIEW_TOKEN_MAX_MS = 30 * 60_000;
const HOLD_MIN_MS = 1500;
const ymd = (d) => d.toISOString().slice(0, 10);
const todayYmd = () => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10);
const dayDiff = (a, b) => Math.round((new Date(`${a}T00:00:00Z`).getTime() - new Date(`${b}T00:00:00Z`).getTime()) / DAY_MS);
const minDwellMs = (days) => Math.min(30_000, 6_000 + 2_000 * days);
const HIDDEN_KEYS = new Set(['motherNurseName', 'motherClientSigner', 'dayNurseName', 'nightNurseName', 'babyClientSigner', 'nightClientSigner']);
function fmt(f, v) {
    if (v === null || v === undefined || v === '')
        return null;
    if (f.kind === 'single')
        return f.options?.find((o) => o.value === v)?.label ?? String(v);
    if (f.kind === 'multi') {
        const arr = Array.isArray(v) ? v : [];
        return arr.length ? arr.map((x) => f.options?.find((o) => o.value === x)?.label ?? String(x)).join('、') : null;
    }
    return f.unit ? `${v} ${f.unit}` : String(v);
}
function describeGroups(groups, values) {
    const out = [];
    for (const g of groups) {
        const items = [];
        for (const f of g.fields) {
            if (HIDDEN_KEYS.has(f.key))
                continue;
            const s = fmt(f, values[f.key]);
            if (s)
                items.push({ label: f.label, value: s });
        }
        if (items.length === 0 && g.title.startsWith('体征'))
            items.push({ label: '体征', value: '无异常' });
        if (items.length)
            out.push({ title: g.title.replace(/（.*）/, '').replace('与签名', ''), items });
    }
    return out;
}
function summarize(rec, babies) {
    const num = (v) => (typeof v === 'number' ? v : null);
    return {
        mother: describeGroups(daily_specs_1.DAILY_MOTHER_FIELDS, rec),
        babies: babies.map((b) => {
            const br = rec.babies.find((x) => x.babyProfileId === b.id);
            if (!br)
                return { title: `宝宝${b.sequenceNo}${b.name ? '：' + b.name : ''}`, groups: [], feeding: null };
            const jaundice = [num(br.jaundiceForehead), num(br.jaundiceCanthus), num(br.jaundiceChest)].filter((x) => x !== null);
            const groups = describeGroups(daily_specs_1.DAILY_BABY_FIELDS, br);
            if (jaundice.length)
                groups.push({ title: '黄疸', items: [{ label: '黄疸平均值', value: String(Math.round((jaundice.reduce((a, c) => a + c, 0) / jaundice.length) * 10) / 10) }] });
            const sum = (k) => br.feedings.reduce((a, f) => a + (f[k] ?? 0), 0);
            return {
                title: `宝宝${b.sequenceNo}${b.name ? '：' + b.name : ''}`,
                groups,
                feeding: { 奶粉合计: `${sum('formulaMl')} ml`, 母乳合计: `${sum('breastMilkMl')} ml`, 小便: `${br.feedings.filter((f) => f.urine === 'YES').length} 次`, 大便: `${br.feedings.filter((f) => f.stool === 'YES').length} 次` },
            };
        }),
    };
}
let CareConfirmPublicService = class CareConfirmPublicService {
    prisma;
    config;
    auditLogService;
    constructor(prisma, config, auditLogService) {
        this.prisma = prisma;
        this.config = config;
        this.auditLogService = auditLogService;
    }
    get secret() {
        return `${this.config.get('JWT_ACCESS_SECRET') ?? 'dev-secret'}:care-confirm`;
    }
    async linkByToken(token) {
        const link = await this.prisma.careConfirmLink.findUnique({
            where: { tokenHash: (0, signature_util_1.sha256)(String(token ?? '')) },
            include: { motherProfile: { include: { customer: { select: { name: true, phone: true } }, babies: { orderBy: { sequenceNo: 'asc' } }, occupancy: { select: { room: { select: { roomNo: true } } } }, store: { select: { name: true } } } } },
        });
        if (!link)
            throw new common_1.NotFoundException('链接无效，请联系护理师重新发送');
        if (link.revokedAt)
            throw new common_1.GoneException('这个链接已作废，请向护理师要最新的链接');
        if (link.expiresAt <= new Date())
            throw new common_1.GoneException('这个链接已过期（7 天有效），请向护理师要新链接');
        return link;
    }
    async info(token) {
        const link = await this.linkByToken(token);
        const now = new Date();
        return {
            customerName: (0, signature_util_1.maskName)(link.motherProfile.customer.name),
            storeName: link.motherProfile.store.name,
            expiresAt: link.expiresAt,
            locked: !!(link.lockedUntil && link.lockedUntil > now),
            lockedUntil: link.lockedUntil && link.lockedUntil > now ? link.lockedUntil : null,
        };
    }
    async verify(token, phoneLast4) {
        const link = await this.linkByToken(token);
        const now = new Date();
        if (link.lockedUntil && link.lockedUntil > now)
            throw new common_1.ForbiddenException(`尝试次数过多，已暂时锁定，请 ${Math.ceil((link.lockedUntil.getTime() - now.getTime()) / 60000)} 分钟后再试`);
        const digits = (link.motherProfile.customer.phone ?? '').replace(/\D/g, '');
        if (digits.length < 4)
            throw new common_1.ConflictException('登记的手机号不完整，无法核验，请联系护理师');
        if (!/^\d{4}$/.test(String(phoneLast4 ?? '')) || digits.slice(-4) !== phoneLast4) {
            const failed = link.failedAttempts + 1;
            const lock = failed >= MAX_FAILED;
            await this.prisma.careConfirmLink.update({ where: { id: link.id }, data: { failedAttempts: lock ? 0 : failed, lockedUntil: lock ? new Date(now.getTime() + LOCK_MS) : link.lockedUntil } });
            throw new common_1.UnauthorizedException(lock ? '手机号后四位不对，已连续错误 5 次，链接锁定 30 分钟' : `手机号后四位不对，还可以再试 ${MAX_FAILED - failed} 次`);
        }
        await this.prisma.careConfirmLink.update({ where: { id: link.id }, data: { failedAttempts: 0, lockedUntil: null, openCount: { increment: 1 }, lastOpenedAt: now } });
        return { session: (0, signature_util_1.signToken)({ lid: link.id, exp: now.getTime() + SESSION_MS }, this.secret) };
    }
    async sessionLink(token, session) {
        const link = await this.linkByToken(token);
        const s = (0, signature_util_1.verifyToken)(session, this.secret);
        if (!s || s.lid !== link.id || s.exp < Date.now())
            throw new common_1.UnauthorizedException('验证已过期，请重新输入手机号后四位');
        return link;
    }
    async recordsInWindow(motherProfileId) {
        const today = todayYmd();
        const from = new Date(`${today}T00:00:00.000Z`);
        from.setUTCDate(from.getUTCDate() - care_signature_service_1.CONFIRM_WINDOW_DAYS);
        const records = await this.prisma.careDailyRecord.findMany({
            where: { motherProfileId, recordDate: { gte: from } },
            include: { ...care_signature_service_1.dayRecordInclude, signatures: { orderBy: { signedAt: 'asc' } }, confirmations: { orderBy: { confirmedAt: 'desc' }, take: 1 } },
            orderBy: { recordDate: 'desc' },
        });
        return records;
    }
    async days(token, session) {
        const link = await this.sessionLink(token, session);
        const m = link.motherProfile;
        const records = await this.recordsInWindow(m.id);
        const hashes = {};
        const names = new Map(care_standards_1.LEVEL_STANDARDS.LEVEL3.services.map((s) => [s.code, s.name]));
        const babyLabel = new Map(m.babies.map((b) => [b.id, `宝宝${b.sequenceNo}${b.name ? '：' + b.name : ''}`]));
        const logs = await this.prisma.careServiceLog.findMany({ where: { motherProfileId: m.id, doneDate: { gte: records.length ? records[records.length - 1].recordDate : new Date() } }, orderBy: [{ doneDate: 'asc' }, { doneTime: 'asc' }] });
        const days = records.map((r) => {
            const date = ymd(r.recordDate);
            const hash = (0, care_signature_service_1.hashDayRecord)(r);
            hashes[date] = hash.slice(0, 16);
            const conf = r.confirmations[0];
            return {
                date,
                stayDay: r.stayDay,
                summary: summarize(r, m.babies),
                nurses: r.signatures.map((s) => ({ signatureId: s.id, name: s.nurseName, shift: s.shift })),
                services: logs
                    .filter((l) => ymd(l.doneDate) === date)
                    .map((l) => ({ name: names.get(l.serviceCode) ?? l.serviceCode, time: l.doneTime, baby: l.babyProfileId ? (babyLabel.get(l.babyProfileId) ?? null) : null, by: l.doneByName })),
                status: !conf ? 'NONE' : conf.contentHash === hash ? 'CONFIRMED' : 'STALE',
                confirmedAt: conf?.confirmedAt ?? null,
                satisfaction: conf?.satisfaction ?? null,
                nurseRatings: conf?.nurseRatings ?? null,
            };
        });
        const viewToken = (0, signature_util_1.signToken)({ lid: link.id, iat: Date.now(), h: hashes }, this.secret);
        return {
            customerName: (0, signature_util_1.maskName)(m.customer.name),
            storeName: m.store.name,
            roomNo: m.occupancy?.room?.roomNo ?? null,
            windowDays: care_signature_service_1.CONFIRM_WINDOW_DAYS,
            holdMinMs: HOLD_MIN_MS,
            minViewMs: minDwellMs(1),
            days,
            viewToken,
        };
    }
    async confirm(token, session, body, meta) {
        const link = await this.sessionLink(token, session);
        const m = link.motherProfile;
        if (!body.acknowledged)
            throw new common_1.BadRequestException('请先勾选“我已阅读以上护理记录小结”');
        const view = (0, signature_util_1.verifyToken)(body.viewToken, this.secret);
        if (!view || view.lid !== link.id)
            throw new common_1.BadRequestException('页面已过期，请刷新后重新查看');
        const age = Date.now() - view.iat;
        if (age > VIEW_TOKEN_MAX_MS)
            throw new common_1.BadRequestException('页面停留太久，请刷新页面重新查看后再确认');
        if (!Array.isArray(body.items) || body.items.length === 0)
            throw new common_1.BadRequestException('请选择要确认的日期');
        if (body.items.length > care_signature_service_1.CONFIRM_WINDOW_DAYS + 1)
            throw new common_1.BadRequestException('一次最多确认 8 天');
        const need = minDwellMs(body.items.length);
        if (age < need)
            throw new common_1.BadRequestException(`请先仔细阅读记录内容（至少需要 ${Math.ceil(need / 1000)} 秒），再进行确认`);
        if (body.method !== 'SIGNATURE' && body.method !== 'BUTTON')
            throw new common_1.BadRequestException('请选择确认方式');
        const deviceId = (0, signature_util_1.cleanDeviceId)(body.deviceId);
        if (!deviceId)
            throw new common_1.BadRequestException('无法识别您的设备，请刷新页面重试');
        const staffDevice = (await this.prisma.staffDevice.count({ where: { deviceId } })) > 0;
        let signature = null;
        let holdMs = null;
        if (body.method === 'SIGNATURE') {
            signature = (0, signature_util_1.assertSignatureImage)(body.signatureData);
        }
        else {
            holdMs = Number.isFinite(body.holdMs) ? Math.min(Math.max(Math.round(body.holdMs), 0), 60_000) : 0;
            if (holdMs < HOLD_MIN_MS)
                throw new common_1.BadRequestException('请按住“确认”按钮不放，直到进度走满');
            if (staffDevice)
                throw new common_1.ForbiddenException('请使用您本人的手机打开链接确认；如果就在护理师的设备上，请改用手写签名确认');
        }
        const dates = body.items.map((i) => i.date);
        if (new Set(dates).size !== dates.length)
            throw new common_1.BadRequestException('日期重复');
        const records = await this.recordsInWindow(m.id);
        const byDate = new Map(records.map((r) => [ymd(r.recordDate), r]));
        const toCreate = [];
        for (const it of body.items) {
            const rec = byDate.get(it.date);
            if (!rec)
                throw new common_1.BadRequestException(`${it.date} 的记录不在可确认范围内（只能确认最近 ${care_signature_service_1.CONFIRM_WINDOW_DAYS} 天、已有记录的日子）`);
            if (!Number.isInteger(it.satisfaction) || it.satisfaction < 1 || it.satisfaction > 5)
                throw new common_1.BadRequestException(`请给 ${it.date} 选择满意度（1~5 星）`);
            const hash = (0, care_signature_service_1.hashDayRecord)(rec);
            if (view.h[it.date] !== hash.slice(0, 16))
                throw new common_1.ConflictException(`${it.date} 的记录刚刚有更新，请刷新页面重新查看后再确认`);
            const prev = rec.confirmations[0];
            if (prev && prev.contentHash === hash)
                throw new common_1.ConflictException(`${it.date} 已经确认过了`);
            const ratings = (it.nurseRatings ?? []).map((r) => {
                const sig = rec.signatures.find((s) => s.id === r.signatureId);
                if (!sig)
                    throw new common_1.BadRequestException(`${it.date} 的评价对象不是这天的值班护理师`);
                if (!Number.isInteger(r.score) || r.score < 1 || r.score > 5)
                    throw new common_1.BadRequestException(`请给 ${sig.nurseName} 选择 1~5 星`);
                return { signatureId: sig.id, nurseAccountId: sig.nurseAccountId, nurseName: sig.nurseName, shift: sig.shift, score: r.score };
            });
            toCreate.push({ rec, hash, satisfaction: it.satisfaction, comment: it.comment?.trim().slice(0, 500) || null, nurseRatings: ratings.length ? ratings : undefined });
        }
        const flags = [];
        if (staffDevice)
            flags.push('STAFF_DEVICE');
        const since = new Date(Date.now() - 30 * DAY_MS);
        const others = await this.prisma.careDailyConfirmation.findMany({ where: { deviceId, confirmedAt: { gte: since }, dailyRecord: { motherProfileId: { not: m.id } } }, select: { dailyRecord: { select: { motherProfileId: true } } } });
        if (new Set(others.map((o) => o.dailyRecord.motherProfileId)).size >= 2)
            flags.push('MULTI_CUSTOMER_DEVICE');
        const batchId = (0, signature_util_1.randomToken)(10);
        await this.prisma.careDailyConfirmation.createMany({
            data: toCreate.map((c) => ({
                tenantId: link.tenantId,
                storeId: link.storeId,
                dailyRecordId: c.rec.id,
                linkId: link.id,
                batchId,
                method: body.method,
                signatureData: signature,
                satisfaction: c.satisfaction,
                nurseRatings: c.nurseRatings,
                comment: c.comment,
                contentHash: c.hash,
                ip: meta.ip ?? null,
                userAgent: meta.userAgent?.slice(0, 300) ?? null,
                deviceId,
                dwellMs: age,
                holdMs,
                riskFlags: flags.length ? flags : undefined,
            })),
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CareDailyConfirmation',
            entityId: batchId,
            afterData: { dates, method: body.method, flags, dwellMs: age },
            remark: `客户确认日常护理记录 ${dates.join('、')}（${body.method === 'SIGNATURE' ? '手写签名' : '点击确认'}）`,
            tenantId: link.tenantId,
            storeId: link.storeId,
            ip: meta.ip,
            userAgent: meta.userAgent,
        });
        return { confirmed: dates, batchId };
    }
};
exports.CareConfirmPublicService = CareConfirmPublicService;
exports.CareConfirmPublicService = CareConfirmPublicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, audit_log_service_1.AuditLogService])
], CareConfirmPublicService);
//# sourceMappingURL=care-confirm-public.service.js.map