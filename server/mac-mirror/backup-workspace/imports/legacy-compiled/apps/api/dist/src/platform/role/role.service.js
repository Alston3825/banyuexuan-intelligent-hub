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
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const role_defaults_1 = require("./role-defaults");
let RoleService = class RoleService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany() {
        return this.prisma.role.findMany({ include: { permissions: { select: { id: true, roleId: true, permissionPointId: true } } } });
    }
    async findOneOrThrow(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: { permissions: { include: { permissionPoint: true } } },
        });
        if (!role)
            throw new common_1.NotFoundException(`Role ${id} 不存在`);
        return role;
    }
    async create(data) {
        const created = await this.prisma.role.create({
            data: {
                ...data,
                code: data.code ?? (0, business_no_util_1.generateBusinessNo)('RL'),
                tenantId: this.ctx.tenantId,
                createdBy: this.ctx.accountId,
            },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'Role',
            entityId: created.id,
            afterData: created,
            ...this.auditCtx(),
        });
        return created;
    }
    async update(id, data, expectedVersion) {
        const before = await this.assertMutable(id);
        if (before.version !== expectedVersion) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.role.update({
            where: { id, version: expectedVersion },
            data: { ...data, version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'Role',
            entityId: id,
            beforeData: before,
            afterData: updated,
            ...this.auditCtx(),
        });
        return updated;
    }
    async delete(id) {
        const before = await this.assertMutable(id);
        const activeAssignmentCount = await this.prisma.accountRoleAssignment.count({
            where: { roleId: id, revokedAt: null },
        });
        if (activeAssignmentCount > 0) {
            throw new common_1.ConflictException(`该角色仍有 ${activeAssignmentCount} 个账号在使用，请先解除这些账号的角色关联后再删除`);
        }
        await this.prisma.$transaction([
            this.prisma.roleOnPermission.deleteMany({ where: { roleId: id } }),
            this.prisma.role.delete({ where: { id } }),
        ]);
        await this.auditLogService.record({
            action: 'DELETE',
            entityType: 'Role',
            entityId: id,
            beforeData: before,
            ...this.auditCtx(),
        });
    }
    async grantPermission(roleId, permissionPointId) {
        await this.assertMutable(roleId);
        await this.assertCanGrant([permissionPointId]);
        const grant = await this.prisma.roleOnPermission.upsert({
            where: { roleId_permissionPointId: { roleId, permissionPointId } },
            update: {},
            create: { roleId, permissionPointId, createdBy: this.ctx.accountId },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'RoleOnPermission',
            entityId: grant.id,
            afterData: grant,
            ...this.auditCtx(),
        });
        return grant;
    }
    async revokePermission(roleId, permissionPointId) {
        await this.assertMutable(roleId);
        await this.prisma.roleOnPermission.deleteMany({ where: { roleId, permissionPointId } });
        await this.auditLogService.record({
            action: 'DELETE',
            entityType: 'RoleOnPermission',
            remark: `roleId=${roleId} permissionPointId=${permissionPointId}`,
            ...this.auditCtx(),
        });
    }
    async changePermissions(roleId, grant, revoke) {
        await this.assertMutable(roleId);
        const g = [...new Set(grant)].filter((id) => !revoke.includes(id));
        await this.assertCanGrant(g);
        const r = [...new Set(revoke)];
        if (g.length + r.length > 1000)
            throw new common_1.BadRequestException('一次最多调整 1000 个权限点');
        const known = await this.prisma.permissionPoint.findMany({ where: { id: { in: [...g, ...r] } }, select: { id: true } });
        if (known.length !== g.length + r.length)
            throw new common_1.BadRequestException('存在不存在的权限点');
        const existing = await this.prisma.roleOnPermission.findMany({ where: { roleId, permissionPointId: { in: g } }, select: { permissionPointId: true } });
        const have = new Set(existing.map((e) => e.permissionPointId));
        const toCreate = g.filter((id) => !have.has(id));
        await this.prisma.$transaction([
            this.prisma.roleOnPermission.createMany({ data: toCreate.map((permissionPointId) => ({ roleId, permissionPointId, createdBy: this.ctx.accountId })) }),
            this.prisma.roleOnPermission.deleteMany({ where: { roleId, permissionPointId: { in: r } } }),
        ]);
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'Role',
            entityId: roleId,
            remark: `批量调整权限：新增 ${toCreate.length} 个，撤销 ${r.length} 个`,
            ...this.auditCtx(),
        });
        return { granted: toCreate.length, revoked: r.length };
    }
    async defaultsPreview(roleId) {
        const role = await this.assertMutable(roleId);
        const points = await this.prisma.permissionPoint.findMany({ select: { id: true, code: true, name: true, type: true } });
        const wanted = (0, role_defaults_1.resolveDefaultCodes)(role.code, points.map((p) => p.code));
        if (!wanted)
            return { hasDefault: false, add: [], remove: [], defaultCount: 0 };
        const buttons = points.filter((p) => p.type === 'BUTTON');
        const want = new Set(wanted);
        const current = await this.prisma.roleOnPermission.findMany({ where: { roleId }, select: { permissionPointId: true } });
        const have = new Set(current.map((c) => c.permissionPointId));
        const add = buttons.filter((p) => want.has(p.code) && !have.has(p.id));
        const remove = buttons.filter((p) => have.has(p.id) && !want.has(p.code));
        return { hasDefault: true, add, remove, defaultCount: buttons.filter((p) => want.has(p.code)).length };
    }
    async restoreDefaults(roleId) {
        const diff = await this.defaultsPreview(roleId);
        if (!diff.hasDefault)
            throw new common_1.BadRequestException('这个角色没有默认权限清单（只有系统预设的岗位角色才有）');
        const res = await this.changePermissions(roleId, diff.add.map((p) => p.id), diff.remove.map((p) => p.id));
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'Role',
            entityId: roleId,
            remark: `恢复默认权限：新增 ${res.granted} 个，撤销 ${res.revoked} 个`,
            ...this.auditCtx(),
        });
        return { ...res, defaultCount: diff.defaultCount };
    }
    async assertCanGrant(permissionPointIds) {
        if (permissionPointIds.length === 0)
            return;
        const mine = await this.ctx.getPermissionCodes();
        const points = await this.prisma.permissionPoint.findMany({ where: { id: { in: permissionPointIds } }, select: { code: true, name: true } });
        const over = points.filter((p) => !mine.has(p.code));
        if (over.length > 0)
            throw new common_1.ForbiddenException(`不能授予你自己都没有的权限（如「${over[0].name}」等共 ${over.length} 项），请联系管理员处理`);
    }
    async assertMutable(id) {
        const role = await this.prisma.role.findUnique({ where: { id } });
        if (!role)
            throw new common_1.NotFoundException(`Role ${id} 不存在`);
        if (role.isSystem)
            throw new common_1.ForbiddenException('系统内置角色不可修改');
        return role;
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
exports.RoleService = RoleService;
exports.RoleService = RoleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], RoleService);
//# sourceMappingURL=role.service.js.map