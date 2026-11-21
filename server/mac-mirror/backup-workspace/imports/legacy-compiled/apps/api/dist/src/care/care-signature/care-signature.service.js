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
exports.CareSignatureService = exports.dayRecordInclude = exports.LINK_TTL_DAYS = exports.CONFIRM_WINDOW_DAYS = void 0;
exports.hashDayRecord = hashDayRecord;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const data_scope_service_1 = require("../../common/scope/data-scope.service");
const signature_util_1 = require("./signature.util");
const DAY_MS = 86_400_000;
exports.CONFIRM_WINDOW_DAYS = 7;
exports.LINK_TTL_DAYS = 7;
exports.dayRecordInclude = { babies: { include: { feedings: true } } };
const ymd = (d) => d.toISOString().slice(0, 10);
const todayYmd = () => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10);
const dayDiff = (a, b) => Math.round((new Date(`${a}T00:00:00Z`).getTime() - new Date(`${b}T00:00:00Z`).getTime()) / DAY_MS);
function hashDayRecord(rec) {
    const { babies: _babies, signatures: _signatures, confirmations: _confirmations, ...own } = rec;
    return (0, signature_util_1.contentHash)({
        ...own,
        babies: [...rec.babies]
            .sort((a, b) => a.babyProfileId.localeCompare(b.babyProfileId))
            .map((b) => ({ ...b, feedings: [...b.feedings].sort((x, y) => x.sortOrder - y.sortOrder) })),
    });
}
let CareSignatureService = class CareSignatureService {
    prisma;
    auditLogService;
    dataScope;
    ctx;
    constructor(prisma, auditLogService, dataScope, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.dataScope = dataScope;
        this.ctx = ctx;
    }
    async mySignature() {
        const a = await this.prisma.account.findUnique({ where: { id: this.ctx.accountId }, select: { signatureData: true, signatureUpdatedAt: true } });
        return { hasSignature: !!a?.signatureData, signatureData: a?.signatureData ?? null, updatedAt: a?.signatureUpdatedAt ?? null };
    }
    async setMySignature(data) {
        const image = (0, signature_util_1.assertSignatureImage)(data);
        await this.prisma.account.update({ where: { id: this.ctx.accountId }, data: { signatureData: image, signatureUpdatedAt: new Date() } });
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'Account',
            entityId: this.ctx.accountId,
            changedFields: ['signatureData'],
            remark: '录入/更新电子签名',
            tenantId: this.ctx.tenantId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return this.mySignature();
    }
    async mother(id) {
        const m = await this.prisma.motherProfile.findFirst({ where: { id, tenantId: this.ctx.tenantId }, include: { customer: { select: { name: true, phone: true } } } });
        if (!m)
            throw new common_1.NotFoundException('母婴档案不存在');
        await this.dataScope.assertStoreAccessible(this.ctx, m.storeId);
        return m;
    }
    async record(motherProfileId, date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
            throw new common_1.BadRequestException('日期格式应为 YYYY-MM-DD');
        return this.prisma.careDailyRecord.findUnique({ where: { motherProfileId_recordDate: { motherProfileId, recordDate: new Date(`${date}T00:00:00.000Z`) } }, include: exports.dayRecordInclude });
    }
    async dayStatus(motherProfileId, date) {
        await this.mother(motherProfileId);
        const rec = await this.record(motherProfileId, date);
        if (!rec)
            return { recordExists: false, signatures: [], confirmation: null };
        const hash = hashDayRecord(rec);
        const [sigs, conf] = await Promise.all([
            this.prisma.careDailySignature.findMany({ where: { dailyRecordId: rec.id }, orderBy: { signedAt: 'asc' } }),
            this.prisma.careDailyConfirmation.findFirst({ where: { dailyRecordId: rec.id }, orderBy: { confirmedAt: 'desc' } }),
        ]);
        return {
            recordExists: true,
            signatures: sigs.map((s) => ({
                id: s.id,
                shift: s.shift,
                nurseAccountId: s.nurseAccountId,
                nurseName: s.nurseName,
                signatureData: s.signatureData,
                signedAt: s.signedAt,
                stale: s.contentHash !== hash,
                mine: s.nurseAccountId === this.ctx.accountId,
            })),
            confirmation: conf
                ? {
                    id: conf.id,
                    method: conf.method,
                    satisfaction: conf.satisfaction,
                    nurseRatings: conf.nurseRatings ?? null,
                    comment: conf.comment,
                    signatureData: conf.signatureData,
                    confirmedAt: conf.confirmedAt,
                    stale: conf.contentHash !== hash,
                    riskFlags: conf.riskFlags ?? [],
                    dwellMs: conf.dwellMs,
                    holdMs: conf.holdMs,
                    ip: conf.ip,
                    userAgent: conf.userAgent,
                }
                : null,
        };
    }
    async overview(motherProfileId) {
        await this.mother(motherProfileId);
        const records = await this.prisma.careDailyRecord.findMany({
            where: { motherProfileId },
            include: { ...exports.dayRecordInclude, signatures: { select: { contentHash: true } }, confirmations: { orderBy: { confirmedAt: 'desc' }, take: 1, select: { contentHash: true, satisfaction: true, method: true } } },
        });
        return records.map((r) => {
            const hash = hashDayRecord(r);
            const conf = r.confirmations[0];
            return {
                date: ymd(r.recordDate),
                signatureCount: r.signatures.length,
                staleSignatures: r.signatures.filter((s) => s.contentHash !== hash).length,
                confirmation: !conf ? 'NONE' : conf.contentHash === hash ? 'CONFIRMED' : 'STALE',
                satisfaction: conf?.satisfaction ?? null,
                confirmMethod: conf?.method ?? null,
            };
        });
    }
    async sign(input) {
        if (!['DAY', 'NIGHT', 'RELIEF'].includes(input.shift))
            throw new common_1.BadRequestException('请选择班次：白班、夜班或替班');
        const m = await this.mother(input.motherProfileId);
        const rec = await this.record(input.motherProfileId, input.date);
        if (!rec)
            throw new common_1.BadRequestException('这一天还没有保存护理记录，先填写并保存再签字');
        const diff = dayDiff(todayYmd(), input.date);
        if (diff < 0)
            throw new common_1.BadRequestException('不能给未来的日期签字');
        if (diff > exports.CONFIRM_WINDOW_DAYS && !(await this.ctx.hasPermission('care.profile.approve'))) {
            throw new common_1.ForbiddenException(`超过 ${exports.CONFIRM_WINDOW_DAYS} 天的记录不能再补签，请联系护理主任`);
        }
        const me = await this.prisma.account.findUnique({ where: { id: this.ctx.accountId }, select: { id: true, realName: true, signatureData: true } });
        if (!me?.signatureData)
            throw new common_1.BadRequestException('您还没有录入电子签名，请先到右上角“我的电子签名”录入一次');
        const hash = hashDayRecord(rec);
        const existing = await this.prisma.careDailySignature.findUnique({ where: { dailyRecordId_nurseAccountId: { dailyRecordId: rec.id, nurseAccountId: me.id } } });
        if (existing && existing.contentHash === hash)
            throw new common_1.ConflictException('您已经在这一天的记录上签过字了');
        const data = {
            shift: input.shift,
            nurseName: me.realName,
            signatureData: me.signatureData,
            contentHash: hash,
            signedAt: new Date(),
            ip: this.ctx.ip ?? null,
            deviceId: (0, signature_util_1.cleanDeviceId)(input.deviceId),
        };
        const saved = existing
            ? await this.prisma.careDailySignature.update({ where: { id: existing.id }, data })
            : await this.prisma.careDailySignature.create({ data: { ...data, tenantId: this.ctx.tenantId, storeId: m.storeId, dailyRecordId: rec.id, nurseAccountId: me.id } });
        await this.auditLogService.record({
            action: existing ? 'UPDATE' : 'CREATE',
            entityType: 'CareDailySignature',
            entityId: saved.id,
            afterData: { date: input.date, shift: input.shift, nurse: me.realName, contentHash: hash },
            remark: `${me.realName} 在 ${input.date} 日常护理记录上签字（${{ DAY: '白班', NIGHT: '夜班', RELIEF: '替班' }[input.shift]}）`,
            tenantId: this.ctx.tenantId,
            storeId: m.storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return this.dayStatus(input.motherProfileId, input.date);
    }
    async unsign(signatureId) {
        const s = await this.prisma.careDailySignature.findFirst({ where: { id: signatureId, tenantId: this.ctx.tenantId }, include: { dailyRecord: true } });
        if (!s)
            throw new common_1.NotFoundException('签字记录不存在');
        if (s.nurseAccountId !== this.ctx.accountId && !(await this.ctx.hasPermission('care.profile.approve')))
            throw new common_1.ForbiddenException('只能撤销自己的签字');
        const confirmed = await this.prisma.careDailyConfirmation.count({ where: { dailyRecordId: s.dailyRecordId } });
        if (confirmed > 0)
            throw new common_1.BadRequestException('客户已经确认过这一天的记录，签字不能再撤销');
        await this.prisma.careDailySignature.delete({ where: { id: s.id } });
        await this.auditLogService.record({
            action: 'DELETE',
            entityType: 'CareDailySignature',
            entityId: s.id,
            beforeData: { date: ymd(s.dailyRecord.recordDate), shift: s.shift, nurse: s.nurseName },
            remark: `撤销 ${s.nurseName} 的签字`,
            tenantId: this.ctx.tenantId,
            storeId: s.storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return { ok: true };
    }
    async createLink(motherProfileId) {
        const m = await this.mother(motherProfileId);
        const digits = (m.customer.phone ?? '').replace(/\D/g, '');
        if (digits.length < 4)
            throw new common_1.BadRequestException('这位客户没有登记完整的手机号，客户无法核验本人。请先到客户档案补全手机号');
        await this.prisma.careConfirmLink.updateMany({ where: { motherProfileId, revokedAt: null, expiresAt: { gt: new Date() } }, data: { revokedAt: new Date() } });
        const token = (0, signature_util_1.randomToken)(32);
        const expiresAt = new Date(Date.now() + exports.LINK_TTL_DAYS * DAY_MS);
        const link = await this.prisma.careConfirmLink.create({
            data: { tenantId: this.ctx.tenantId, storeId: m.storeId, motherProfileId, tokenHash: (0, signature_util_1.sha256)(token), expiresAt, createdBy: this.ctx.accountId },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CareConfirmLink',
            entityId: link.id,
            remark: `生成客户护理记录确认链接（${m.customer.name}，${exports.LINK_TTL_DAYS} 天有效）`,
            tenantId: this.ctx.tenantId,
            storeId: m.storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return { id: link.id, token, path: `/c/${token}`, expiresAt };
    }
    async listLinks(motherProfileId) {
        await this.mother(motherProfileId);
        const links = await this.prisma.careConfirmLink.findMany({ where: { motherProfileId }, orderBy: { createdAt: 'desc' }, take: 5 });
        const now = new Date();
        return links.map((l) => ({
            id: l.id,
            createdAt: l.createdAt,
            expiresAt: l.expiresAt,
            status: l.revokedAt ? 'REVOKED' : l.expiresAt <= now ? 'EXPIRED' : l.lockedUntil && l.lockedUntil > now ? 'LOCKED' : 'ACTIVE',
            openCount: l.openCount,
            lastOpenedAt: l.lastOpenedAt,
        }));
    }
    async revokeLink(id) {
        const l = await this.prisma.careConfirmLink.findFirst({ where: { id, tenantId: this.ctx.tenantId } });
        if (!l)
            throw new common_1.NotFoundException('链接不存在');
        await this.mother(l.motherProfileId);
        await this.prisma.careConfirmLink.update({ where: { id }, data: { revokedAt: l.revokedAt ?? new Date() } });
        return { ok: true };
    }
};
exports.CareSignatureService = CareSignatureService;
exports.CareSignatureService = CareSignatureService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        data_scope_service_1.DataScopeService,
        request_context_service_1.RequestContextService])
], CareSignatureService);
//# sourceMappingURL=care-signature.service.js.map