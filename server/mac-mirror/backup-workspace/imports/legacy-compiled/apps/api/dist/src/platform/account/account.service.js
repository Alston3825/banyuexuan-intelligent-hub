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
exports.AccountService = void 0;
const common_1 = require("@nestjs/common");
const employee_no_util_1 = require("../../common/utils/employee-no.util");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const data_scope_service_1 = require("../../common/scope/data-scope.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const password_service_1 = require("../../auth/password.service");
const ACCOUNT_OMIT = { passwordHash: true };
let AccountService = class AccountService {
    prisma;
    dataScopeService;
    auditLogService;
    passwordService;
    ctx;
    constructor(prisma, dataScopeService, auditLogService, passwordService, ctx) {
        this.prisma = prisma;
        this.dataScopeService = dataScopeService;
        this.auditLogService = auditLogService;
        this.passwordService = passwordService;
        this.ctx = ctx;
    }
    async findMany() {
        const allowed = await this.dataScopeService.resolveAllowedStoreIds(this.ctx);
        return this.prisma.account.findMany({
            where: allowed === 'ALL' ? {} : { storeId: { in: allowed } },
            omit: ACCOUNT_OMIT,
        });
    }
    async findOneOrThrow(id) {
        const account = await this.prisma.account.findUnique({
            where: { id },
            omit: ACCOUNT_OMIT,
            include: { roleAssignments: { where: { revokedAt: null }, include: { role: true } } },
        });
        if (!account)
            throw new common_1.NotFoundException(`Account ${id} 不存在`);
        return account;
    }
    async assertPhoneFree(phone, exceptAccountId) {
        if (!phone)
            return;
        const dup = await this.prisma.account.findFirst({ where: { tenantId: this.ctx.tenantId, phone, ...(exceptAccountId ? { NOT: { id: exceptAccountId } } : {}) }, select: { realName: true, status: true } });
        if (dup)
            throw new common_1.ConflictException(`手机号 ${phone} 已经是「${dup.realName}」的账号了${dup.status !== 'ACTIVE' ? '（已停用）' : ''}，同一个手机号只能开一个账号`);
    }
    async assertEmployeeNoFree(employeeNo) {
        const dup = await this.prisma.employeeProfile.findFirst({ where: { tenantId: this.ctx.tenantId, activeEmployeeNo: employeeNo }, include: { account: { select: { realName: true } } } });
        if (dup)
            throw new common_1.ConflictException(`工号 ${employeeNo} 已经分配给「${dup.account.realName}」，请换一个（离职归档的员工工号才可以回收）`);
    }
    async create(data) {
        await this.dataScopeService.assertStoreAccessible(this.ctx, data.storeId);
        const { password, employeeNo, hireDate, ...restRaw } = data;
        const rest = { ...restRaw, phone: restRaw.phone?.trim() || undefined, email: restRaw.email?.trim() || undefined };
        await this.assertPhoneFree(rest.phone);
        if (employeeNo && hireDate) {
            await this.assertEmployeeNoFree(employeeNo);
            await (0, employee_no_util_1.assertEmployeeNoForStore)(this.prisma, rest.storeId, employeeNo);
        }
        const passwordHash = await this.passwordService.hash(password);
        const created = await this.prisma.$transaction(async (tx) => {
            const account = await tx.account.create({
                data: { ...rest, passwordHash, tenantId: this.ctx.tenantId, createdBy: this.ctx.accountId },
                omit: ACCOUNT_OMIT,
            });
            if (employeeNo && hireDate) {
                await tx.employeeProfile.create({
                    data: {
                        tenantId: this.ctx.tenantId,
                        accountId: account.id,
                        employeeNo,
                        activeEmployeeNo: employeeNo,
                        hireDate: new Date(hireDate),
                        createdBy: this.ctx.accountId,
                    },
                });
            }
            return account;
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'Account',
            entityId: created.id,
            afterData: created,
            ...this.auditCtx(),
        });
        return created;
    }
    async update(id, data, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        if (data.phone !== undefined) {
            data = { ...data, phone: data.phone?.trim() || null };
            if (data.phone && data.phone !== before.phone)
                await this.assertPhoneFree(data.phone, id);
        }
        if (data.storeId && data.storeId !== before.storeId)
            await this.dataScopeService.assertStoreAccessible(this.ctx, data.storeId);
        if (before.version !== expectedVersion) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.account.update({
            where: { id, version: expectedVersion },
            data: { ...data, version: { increment: 1 } },
            omit: ACCOUNT_OMIT,
        }));
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'Account',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: Object.keys(data),
            ...this.auditCtx(),
        });
        return updated;
    }
    async resetPassword(id, newPassword) {
        await this.findOneOrThrow(id);
        const passwordHash = await this.passwordService.hash(newPassword);
        await this.prisma.account.update({ where: { id }, data: { passwordHash, version: { increment: 1 } } });
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'Account',
            entityId: id,
            changedFields: ['passwordHash'],
            remark: '管理员重置密码',
            ...this.auditCtx(),
        });
    }
    async assignRole(accountId, roleId, scopeType, scopeIds = []) {
        await this.findOneOrThrow(accountId);
        const tenantId = this.ctx.tenantId;
        const role = await this.prisma.role.findFirst({ where: { id: roleId, tenantId }, include: { permissions: { select: { permissionPoint: { select: { code: true } } } } } });
        if (!role)
            throw new common_1.BadRequestException('所选角色不存在（可能已被删除），请刷新页面后重选');
        const needsId = ['REGION', 'STORE', 'DEPARTMENT', 'TEAM'].includes(scopeType);
        const ids = needsId ? [...new Set(scopeIds.filter(Boolean))] : [];
        if (needsId && ids.length === 0)
            throw new common_1.BadRequestException('请选择范围对象（比如“门店级”要选具体是哪家门店，可以多选），不选的话这个角色不会生效');
        const targets = needsId ? ids : [null];
        const storeOf = new Map();
        for (const id of ids) {
            if (scopeType === 'STORE') {
                if (!(await this.prisma.store.findFirst({ where: { id, tenantId }, select: { id: true } })))
                    throw new common_1.BadRequestException('所选门店不存在');
                storeOf.set(id, id);
            }
            else if (scopeType === 'REGION') {
                if (!(await this.prisma.region.findFirst({ where: { id, tenantId }, select: { id: true } })))
                    throw new common_1.BadRequestException('所选区域不存在');
                storeOf.set(id, null);
            }
            else if (scopeType === 'DEPARTMENT') {
                const d = await this.prisma.department.findFirst({ where: { id, tenantId }, select: { storeId: true } });
                if (!d)
                    throw new common_1.BadRequestException('所选部门不存在');
                storeOf.set(id, d.storeId);
            }
            else if (scopeType === 'TEAM') {
                const t = await this.prisma.team.findFirst({ where: { id, tenantId }, select: { storeId: true } });
                if (!t)
                    throw new common_1.BadRequestException('所选班组不存在');
                storeOf.set(id, t.storeId);
            }
        }
        const myCodes = await this.ctx.getPermissionCodes();
        const missing = role.permissions.map((p) => p.permissionPoint.code).filter((c) => !myCodes.has(c));
        if (missing.length > 0)
            throw new common_1.ForbiddenException(`不能分配权限比自己大的角色「${role.name}」（它包含你自己都没有的 ${missing.length} 项权限）。请联系管理员处理`);
        const allowedStores = await this.dataScopeService.resolveAllowedStoreIds(this.ctx);
        if (allowedStores !== 'ALL') {
            if (scopeType === 'TENANT')
                throw new common_1.ForbiddenException('只有管理员才能分配“全公司”范围');
            if (scopeType === 'REGION')
                throw new common_1.ForbiddenException('只有管理员才能分配“区域级”范围');
            for (const id of ids) {
                const sid = storeOf.get(id);
                if (sid && !allowedStores.includes(sid))
                    throw new common_1.ForbiddenException('不能分配到你自己管不到的门店');
            }
        }
        const created = [];
        let skipped = 0;
        for (const target of targets) {
            const dup = await this.prisma.accountRoleAssignment.findFirst({ where: { accountId, roleId, scopeType, scopeId: target, revokedAt: null } });
            if (dup) {
                skipped++;
                continue;
            }
            const assignment = await this.prisma.accountRoleAssignment.create({
                data: { tenantId, accountId, roleId, scopeType, scopeId: target, grantedBy: this.ctx.accountId },
            });
            await this.auditLogService.record({
                action: 'CREATE',
                entityType: 'AccountRoleAssignment',
                entityId: assignment.id,
                afterData: assignment,
                ...this.auditCtx(),
            });
            created.push(assignment);
        }
        if (created.length === 0)
            throw new common_1.ConflictException(`这位员工已经有「${role.name}」这个角色（所选范围都已分配过），不需要重复分配`);
        return { ...created[0], createdCount: created.length, skippedCount: skipped };
    }
    async remove(id) {
        if (id === this.ctx.accountId) {
            throw new common_1.ConflictException('不能删除当前登录使用的账号');
        }
        const before = await this.findOneOrThrow(id);
        const [employeeProfile, customerCount, leadCount, opportunityCount, expenseClaimCount, generalMemoCount, vehicleBookingCount, examAttemptCount, outreachTaskCount,] = await Promise.all([
            this.prisma.employeeProfile.findUnique({
                where: { accountId: id },
                include: { _count: { select: { scheduleEntries: true, commissionAllocations: true, payrollRecords: true, leaveRequests: true } } },
            }),
            this.prisma.customer.count({ where: { assignedToId: id } }),
            this.prisma.lead.count({ where: { assignedToId: id } }),
            this.prisma.salesOpportunity.count({ where: { assignedToId: id } }),
            this.prisma.expenseClaim.count({ where: { applicantId: id } }),
            this.prisma.generalMemo.count({ where: { applicantId: id } }),
            this.prisma.vehicleBooking.count({ where: { applicantId: id } }),
            this.prisma.examAttempt.count({ where: { OR: [{ accountId: id }, { gradedById: id }] } }),
            this.prisma.careOutreachTask.count({ where: { completedById: id } }),
        ]);
        const blockers = [];
        if (employeeProfile) {
            const c = employeeProfile._count;
            if (c.scheduleEntries)
                blockers.push(`${c.scheduleEntries} 条排班记录`);
            if (c.commissionAllocations)
                blockers.push(`${c.commissionAllocations} 条提成记录`);
            if (c.payrollRecords)
                blockers.push(`${c.payrollRecords} 条薪资记录`);
            if (c.leaveRequests)
                blockers.push(`${c.leaveRequests} 条请假记录`);
        }
        if (customerCount)
            blockers.push(`${customerCount} 个客户`);
        if (leadCount)
            blockers.push(`${leadCount} 条线索`);
        if (opportunityCount)
            blockers.push(`${opportunityCount} 个销售机会`);
        if (expenseClaimCount)
            blockers.push(`${expenseClaimCount} 条报销申请`);
        if (generalMemoCount)
            blockers.push(`${generalMemoCount} 条日常签呈`);
        if (vehicleBookingCount)
            blockers.push(`${vehicleBookingCount} 条用车申请`);
        if (examAttemptCount)
            blockers.push(`${examAttemptCount} 条考试记录`);
        if (outreachTaskCount)
            blockers.push(`${outreachTaskCount} 条离店关怀任务`);
        if (blockers.length > 0) {
            throw new common_1.ConflictException(`该账号名下还有${blockers.join('、')}，无法删除，请改用"禁用"停止其登录`);
        }
        await this.prisma.$transaction([
            this.prisma.refreshToken.deleteMany({ where: { accountId: id } }),
            this.prisma.accountRoleAssignment.deleteMany({ where: { accountId: id } }),
            this.prisma.employeeProfile.deleteMany({ where: { accountId: id } }),
            this.prisma.account.delete({ where: { id } }),
        ]);
        await this.auditLogService.record({
            action: 'DELETE',
            entityType: 'Account',
            entityId: id,
            beforeData: before,
            ...this.auditCtx(),
        });
    }
    async revokeRoleAssignment(accountId, assignmentId) {
        const found = await this.prisma.accountRoleAssignment.findFirst({ where: { id: assignmentId, accountId, tenantId: this.ctx.tenantId } });
        if (!found)
            throw new common_1.NotFoundException('找不到这条角色分配');
        const assignment = await this.prisma.accountRoleAssignment.update({
            where: { id: assignmentId },
            data: { revokedAt: new Date() },
        });
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'AccountRoleAssignment',
            entityId: assignmentId,
            afterData: assignment,
            remark: '撤销角色授权',
            ...this.auditCtx(),
        });
        return assignment;
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
exports.AccountService = AccountService;
exports.AccountService = AccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        data_scope_service_1.DataScopeService,
        audit_log_service_1.AuditLogService,
        password_service_1.PasswordService,
        request_context_service_1.RequestContextService])
], AccountService);
//# sourceMappingURL=account.service.js.map