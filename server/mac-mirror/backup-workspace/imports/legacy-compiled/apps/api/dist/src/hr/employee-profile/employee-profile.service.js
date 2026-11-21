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
exports.EmployeeProfileService = void 0;
const integration_events_service_1 = require("../../integration/integration-events.service");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const id_card_util_1 = require("../../common/utils/id-card.util");
const employee_no_util_1 = require("../../common/utils/employee-no.util");
const includeProfile = {
    account: {
        select: {
            id: true,
            realName: true,
            username: true,
            phone: true,
            storeId: true,
            departmentId: true,
            positionId: true,
            store: { select: { name: true } },
            department: { select: { name: true } },
            position: { select: { name: true } },
        },
    },
};
function tenureYears(hireDate, end = new Date()) {
    let years = end.getFullYear() - hireDate.getFullYear();
    const beforeAnniversary = end.getMonth() < hireDate.getMonth() || (end.getMonth() === hireDate.getMonth() && end.getDate() < hireDate.getDate());
    if (beforeAnniversary)
        years -= 1;
    return Math.max(0, years);
}
const DATE_FIELDS = ['hireDate', 'healthCertExpiresAt', 'contractExpiresAt', 'probationEndsAt', 'terminationDate'];
const TEXT_FIELDS = ['terminationReason', 'bankName', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation', 'address', 'remark'];
let EmployeeProfileService = class EmployeeProfileService {
    prisma;
    auditLogService;
    ctx;
    integrationEvents;
    constructor(prisma, auditLogService, ctx, integrationEvents) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
        this.integrationEvents = integrationEvents;
    }
    decorate(p) {
        return {
            ...p,
            phone: p.account.phone,
            storeName: p.account.store?.name ?? null,
            departmentName: p.account.department?.name ?? null,
            positionName: p.account.position?.name ?? null,
            tenureYears: tenureYears(p.hireDate, p.status === 'TERMINATED' && p.terminationDate ? p.terminationDate : new Date()),
        };
    }
    async findMany(query = {}) {
        const keyword = query.keyword?.trim();
        const rows = await this.prisma.employeeProfile.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                status: query.status,
                archivedAt: query.archived === 'only' ? { not: null } : query.archived === 'all' ? undefined : null,
                account: {
                    storeId: query.storeId || undefined,
                    departmentId: query.departmentId || undefined,
                },
                ...(keyword ? { OR: [{ employeeNo: { contains: keyword } }, { account: { realName: { contains: keyword } } }] } : {}),
            },
            include: includeProfile,
            orderBy: [{ employeeNo: 'asc' }],
        });
        return rows.map((p) => this.decorate(p));
    }
    async findOneOrThrow(id) {
        const profile = await this.prisma.employeeProfile.findUnique({ where: { id }, include: includeProfile });
        if (!profile)
            throw new common_1.NotFoundException(`EmployeeProfile ${id} 不存在`);
        return this.decorate(profile);
    }
    async expiryAlerts(withinDays = 30) {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() + withinDays);
        const now = new Date();
        const profiles = await this.prisma.employeeProfile.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                status: 'ACTIVE',
                OR: [
                    { healthCertExpiresAt: { lte: threshold } },
                    { contractExpiresAt: { lte: threshold } },
                    { probationEndsAt: { lte: threshold } },
                ],
            },
            include: includeProfile,
        });
        return profiles.map((p) => ({
            ...this.decorate(p),
            alerts: [
                p.healthCertExpiresAt && p.healthCertExpiresAt <= threshold
                    ? { type: 'HEALTH_CERT', expiresAt: p.healthCertExpiresAt, isExpired: p.healthCertExpiresAt < now }
                    : null,
                p.contractExpiresAt && p.contractExpiresAt <= threshold
                    ? { type: 'CONTRACT', expiresAt: p.contractExpiresAt, isExpired: p.contractExpiresAt < now }
                    : null,
                p.probationEndsAt && p.probationEndsAt <= threshold
                    ? { type: 'PROBATION', expiresAt: p.probationEndsAt, isExpired: p.probationEndsAt < now }
                    : null,
            ].filter((a) => a !== null),
        }));
    }
    async idCardFields(raw, selfId) {
        if (raw === undefined)
            return {};
        const text = raw.trim();
        if (!text)
            return { idCardNo: null, gender: null, birthDate: null };
        const check = (0, id_card_util_1.checkIdCard)(text);
        if (!check.valid)
            throw new common_1.BadRequestException(check.reason ?? '身份证号不正确');
        const dup = await this.prisma.employeeProfile.findFirst({ where: { tenantId: this.ctx.tenantId, idCardNo: check.normalized, ...(selfId ? { NOT: { id: selfId } } : {}) }, include: { account: { select: { realName: true } } } });
        if (dup)
            throw new common_1.ConflictException(`这个身份证号已经是员工“${dup.account.realName}”的档案了`);
        return { idCardNo: check.normalized, gender: check.gender, birthDate: new Date(`${check.birthday}T00:00:00.000Z`) };
    }
    bankAccountField(raw) {
        if (raw === undefined)
            return {};
        const text = raw.replace(/\s/g, '');
        if (!text)
            return { bankAccountNo: null };
        if (!/^\d{6,32}$/.test(text))
            throw new common_1.BadRequestException('工资卡账号应为 6~32 位数字');
        return { bankAccountNo: text };
    }
    async assertEmployeeNoFree(employeeNo, selfId) {
        const dup = await this.prisma.employeeProfile.findFirst({
            where: { tenantId: this.ctx.tenantId, activeEmployeeNo: employeeNo, ...(selfId ? { NOT: { id: selfId } } : {}) },
            include: { account: { select: { realName: true } } },
        });
        if (dup)
            throw new common_1.ConflictException(`工号 ${employeeNo} 已经分配给「${dup.account.realName}」，请换一个（离职归档的员工工号才可以回收）`);
    }
    dates(dto) {
        const out = {};
        for (const f of DATE_FIELDS) {
            const v = dto[f];
            if (typeof v === 'string' && v)
                out[f] = new Date(v);
        }
        return out;
    }
    texts(dto) {
        const out = {};
        for (const f of TEXT_FIELDS) {
            const v = dto[f];
            if (typeof v === 'string')
                out[f] = v.trim() || null;
        }
        return out;
    }
    async create(dto) {
        const account = await this.prisma.account.findUnique({ where: { id: dto.accountId } });
        if (!account)
            throw new common_1.NotFoundException(`Account ${dto.accountId} 不存在`);
        const existing = await this.prisma.employeeProfile.findUnique({ where: { accountId: dto.accountId } });
        if (existing)
            throw new common_1.BadRequestException('该账号已建立员工档案');
        await this.assertEmployeeNoFree(dto.employeeNo);
        await (0, employee_no_util_1.assertEmployeeNoForStore)(this.prisma, account.storeId, dto.employeeNo);
        const idCard = await this.idCardFields(dto.idCardNo);
        const created = await this.prisma.employeeProfile.create({
            data: {
                tenantId: this.ctx.tenantId,
                accountId: dto.accountId,
                employeeNo: dto.employeeNo,
                activeEmployeeNo: dto.employeeNo,
                employmentType: dto.employmentType,
                contractType: dto.contractType,
                socialInsurance: dto.socialInsurance,
                ...this.dates(dto),
                hireDate: new Date(dto.hireDate),
                ...this.texts(dto),
                ...idCard,
                ...this.bankAccountField(dto.bankAccountNo),
                createdBy: this.ctx.accountId,
            },
            include: includeProfile,
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'EmployeeProfile',
            entityId: created.id,
            afterData: created,
            tenantId: this.ctx.tenantId,
            storeId: account.storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return this.decorate(created);
    }
    async update(id, dto) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== dto.version)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        const { version: _version, ...rest } = dto;
        if (before.archivedAt)
            throw new common_1.BadRequestException('这位员工已离职归档，档案只读。需要修改请管理员先“恢复在职”');
        if (rest.employeeNo !== undefined) {
            if (!rest.employeeNo.trim())
                throw new common_1.BadRequestException('工号不能为空');
            if (rest.employeeNo !== before.employeeNo) {
                if (!(await this.ctx.hasPermission('hr.employee-profile.change-no')))
                    throw new common_1.ForbiddenException('工号一旦分配，只有管理员才能修改');
                await this.assertEmployeeNoFree(rest.employeeNo, id);
                const acc = await this.prisma.account.findUnique({ where: { id: before.accountId }, select: { storeId: true } });
                await (0, employee_no_util_1.assertEmployeeNoForStore)(this.prisma, acc?.storeId, rest.employeeNo);
            }
        }
        const idCard = await this.idCardFields(rest.idCardNo, id);
        let watchPatch = {};
        if (rest.watchId !== undefined) {
            const w = rest.watchId.trim();
            if (w) {
                const dup = await this.prisma.employeeProfile.findFirst({ where: { tenantId: this.ctx.tenantId, watchId: w, id: { not: id } }, include: { account: { select: { realName: true } } } });
                if (dup)
                    throw new common_1.ConflictException(`手表 ${w} 已绑定给 ${dup.account.realName}，请先解绑`);
            }
            watchPatch = { watchId: w || null };
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.employeeProfile.update({
            where: { id, version: dto.version },
            data: {
                employeeNo: rest.employeeNo,
                ...(rest.employeeNo !== undefined ? { activeEmployeeNo: rest.employeeNo } : {}),
                employmentType: rest.employmentType,
                contractType: rest.contractType,
                socialInsurance: rest.socialInsurance,
                status: rest.status,
                ...this.dates(rest),
                ...this.texts(rest),
                ...idCard,
                ...this.bankAccountField(rest.bankAccountNo),
                ...watchPatch,
                ...(rest.dutyStatus !== undefined ? { dutyStatus: rest.dutyStatus } : {}),
                ...(rest.responsibleFloors !== undefined ? { responsibleFloors: rest.responsibleFloors } : {}),
                version: { increment: 1 },
            },
            include: includeProfile,
        }));
        if (before.account.storeId && (rest.dutyStatus !== undefined || rest.watchId !== undefined || rest.responsibleFloors !== undefined)) {
            await this.integrationEvents.emit(this.ctx.tenantId, before.account.storeId, 'staff.duty_changed', before.accountId, {
                staff_id: before.accountId,
                store_id: before.account.storeId,
                duty_status: updated.dutyStatus,
                watch_id: updated.watchId,
                responsible_floors: updated.responsibleFloors ?? [],
            });
        }
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'EmployeeProfile',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: Object.keys(rest),
            tenantId: this.ctx.tenantId,
            storeId: before.account.storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return this.decorate(updated);
    }
    nextNo(storeId) {
        return (0, employee_no_util_1.nextEmployeeNo)(this.prisma, this.ctx.tenantId, [], storeId).then((employeeNo) => ({ employeeNo }));
    }
    async archive(id, input) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== input.version)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        if (before.archivedAt)
            throw new common_1.BadRequestException('这位员工已经归档过了');
        const termination = input.terminationDate ? new Date(input.terminationDate) : (before.terminationDate ?? new Date());
        const updated = await this.prisma.$transaction(async (tx) => {
            const p = await tx.employeeProfile.update({
                where: { id },
                data: {
                    status: 'TERMINATED',
                    terminationDate: termination,
                    terminationReason: input.reason?.trim() || before.terminationReason || undefined,
                    archivedAt: new Date(),
                    activeEmployeeNo: null,
                    version: { increment: 1 },
                },
                include: includeProfile,
            });
            await tx.account.update({ where: { id: before.accountId }, data: { status: 'DISABLED', version: { increment: 1 } } });
            await tx.refreshToken.updateMany({ where: { accountId: before.accountId, revokedAt: null }, data: { revokedAt: new Date() } });
            return p;
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'EmployeeProfile',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `离职归档：${before.account.realName}，工号 ${before.employeeNo} 已释放`,
            tenantId: this.ctx.tenantId,
            storeId: before.account.storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return this.decorate(updated);
    }
    async restore(id, input) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== input.version)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        if (!before.archivedAt)
            throw new common_1.BadRequestException('这位员工没有归档');
        const employeeNo = input.employeeNo?.trim() || before.employeeNo;
        await this.assertEmployeeNoFree(employeeNo, id);
        const updated = await this.prisma.$transaction(async (tx) => {
            const p = await tx.employeeProfile.update({
                where: { id },
                data: { employeeNo, activeEmployeeNo: employeeNo, archivedAt: null, status: 'ACTIVE', terminationDate: null, terminationReason: null, version: { increment: 1 } },
                include: includeProfile,
            });
            await tx.account.update({ where: { id: before.accountId }, data: { status: 'ACTIVE', version: { increment: 1 } } });
            return p;
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'EmployeeProfile',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `恢复在职：${before.account.realName}，工号 ${employeeNo}`,
            tenantId: this.ctx.tenantId,
            storeId: before.account.storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return this.decorate(updated);
    }
};
exports.EmployeeProfileService = EmployeeProfileService;
exports.EmployeeProfileService = EmployeeProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService,
        integration_events_service_1.IntegrationEventsService])
], EmployeeProfileService);
//# sourceMappingURL=employee-profile.service.js.map