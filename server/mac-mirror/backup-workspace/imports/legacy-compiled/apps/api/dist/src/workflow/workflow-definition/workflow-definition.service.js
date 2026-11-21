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
exports.WorkflowDefinitionService = exports.SaveWorkflowDefinitionDto = exports.WorkflowNodeInput = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
class WorkflowNodeInput {
    name;
    approverType;
    approverRoleId;
    approverRoleIds;
    approverAccountId;
    approverAccountIds;
    approvalMode;
    timeoutHours;
}
exports.WorkflowNodeInput = WorkflowNodeInput;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], WorkflowNodeInput.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['ROLE', 'ACCOUNT']),
    __metadata("design:type", String)
], WorkflowNodeInput.prototype, "approverType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowNodeInput.prototype, "approverRoleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], WorkflowNodeInput.prototype, "approverRoleIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowNodeInput.prototype, "approverAccountId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], WorkflowNodeInput.prototype, "approverAccountIds", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['ALL', 'ANY']),
    __metadata("design:type", String)
], WorkflowNodeInput.prototype, "approvalMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(720),
    __metadata("design:type", Object)
], WorkflowNodeInput.prototype, "timeoutHours", void 0);
class SaveWorkflowDefinitionDto {
    name;
    enabled;
    nodes;
}
exports.SaveWorkflowDefinitionDto = SaveWorkflowDefinitionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], SaveWorkflowDefinitionDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveWorkflowDefinitionDto.prototype, "enabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkflowNodeInput),
    __metadata("design:type", Array)
], SaveWorkflowDefinitionDto.prototype, "nodes", void 0);
let WorkflowDefinitionService = class WorkflowDefinitionService {
    prisma;
    ctx;
    auditLogService;
    constructor(prisma, ctx, auditLogService) {
        this.prisma = prisma;
        this.ctx = ctx;
        this.auditLogService = auditLogService;
    }
    findMany() {
        return this.prisma.workflowDefinition.findMany({
            where: { tenantId: this.ctx.tenantId, status: 'PUBLISHED' },
            include: { nodes: { orderBy: { seq: 'asc' } } },
        });
    }
    async listForSettings() {
        const all = await this.prisma.workflowDefinition.findMany({
            where: { tenantId: this.ctx.tenantId },
            include: { nodes: { orderBy: { seq: 'asc' } } },
            orderBy: [{ code: 'asc' }, { version: 'desc' }],
        });
        const latest = new Map();
        for (const d of all)
            if (!latest.has(d.code))
                latest.set(d.code, d);
        const defs = [...latest.values()];
        const roleIds = defs.flatMap((d) => d.nodes.flatMap((n) => this.roleIdsOf(n)));
        const accIds = defs.flatMap((d) => d.nodes.flatMap((n) => [n.approverAccountId, ...this.idsOf(n)])).filter((x) => !!x);
        const [roles, accounts, inflight] = await Promise.all([
            this.prisma.role.findMany({ where: { id: { in: roleIds } }, select: { id: true, name: true } }),
            this.prisma.account.findMany({ where: { id: { in: accIds } }, select: { id: true, realName: true } }),
            this.prisma.workflowInstance.groupBy({ by: ['workflowDefinitionId'], where: { tenantId: this.ctx.tenantId, status: 'IN_REVIEW' }, _count: { _all: true } }),
        ]);
        const roleName = new Map(roles.map((r) => [r.id, r.name]));
        const accName = new Map(accounts.map((a) => [a.id, a.realName]));
        const inflightByDef = new Map(inflight.map((g) => [g.workflowDefinitionId, g._count._all]));
        const versionsOf = (code) => all.filter((d) => d.code === code).map((d) => d.id);
        return defs.map((d) => ({
            id: d.id,
            code: d.code,
            name: d.name,
            version: d.version,
            enabled: d.status === 'PUBLISHED',
            updatedAt: d.updatedAt,
            inReview: versionsOf(d.code).reduce((n, id) => n + (inflightByDef.get(id) ?? 0), 0),
            nodes: d.nodes.map((n) => ({
                seq: n.seq,
                name: n.name,
                approverType: n.approverType,
                approverRoleId: n.approverRoleId,
                approverRoleIds: this.roleIdsOf(n),
                approverAccountId: n.approverAccountId,
                approverAccountIds: this.idsOf(n),
                approverLabel: [
                    ...(this.roleIdsOf(n).length > 0 ? [`角色：${this.roleIdsOf(n).map((id) => roleName.get(id) ?? '（角色已删除）').join('、')}`] : []),
                    ...(this.idsOf(n).length > 0 ? [`员工：${this.idsOf(n).map((id) => accName.get(id) ?? '（员工已删除）').join('、')}`] : []),
                ].join('；') || '（未设置）',
                approvalMode: n.approvalMode,
                timeoutHours: n.timeoutHours,
            })),
        }));
    }
    accountIdsOf(n) {
        const arr = n.approverAccountIds && n.approverAccountIds.length > 0 ? n.approverAccountIds : n.approverType === 'ACCOUNT' && n.approverAccountId ? [n.approverAccountId] : [];
        return [...new Set(arr)];
    }
    inputRoleIds(n) {
        const arr = n.approverRoleIds && n.approverRoleIds.length > 0 ? n.approverRoleIds : n.approverType === 'ROLE' && n.approverRoleId ? [n.approverRoleId] : [];
        return [...new Set(arr)];
    }
    roleIdsOf(n) {
        const arr = Array.isArray(n.approverRoleIds) ? n.approverRoleIds.filter((x) => typeof x === 'string') : [];
        return arr.length > 0 ? arr : n.approverRoleId ? [n.approverRoleId] : [];
    }
    idsOf(n) {
        const arr = Array.isArray(n.approverAccountIds) ? n.approverAccountIds.filter((x) => typeof x === 'string') : [];
        return arr.length > 0 ? arr : n.approverAccountId ? [n.approverAccountId] : [];
    }
    async save(code, dto) {
        const tenantId = this.ctx.tenantId;
        const latest = await this.prisma.workflowDefinition.findFirst({ where: { tenantId, code }, orderBy: { version: 'desc' }, include: { nodes: { orderBy: { seq: 'asc' } } } });
        if (!latest)
            throw new common_1.NotFoundException('没有这类审批流程');
        const name = dto.name?.trim() || latest.name;
        if (!dto.nodes) {
            await this.prisma.workflowDefinition.update({ where: { id: latest.id }, data: { name, status: dto.enabled === undefined ? latest.status : dto.enabled ? 'PUBLISHED' : 'DISABLED' } });
            await this.audit(latest.id, `${dto.enabled === false ? '停用' : dto.enabled ? '启用' : '修改名称'}审批流程「${name}」`);
            return this.one(code);
        }
        const nodes = dto.nodes;
        if (nodes.length < 1 || nodes.length > 8)
            throw new common_1.BadRequestException('审批流程至少要有 1 个节点，最多 8 个');
        for (const [i, n] of nodes.entries()) {
            if (!n.name?.trim())
                throw new common_1.BadRequestException(`第 ${i + 1} 个节点请填写名称`);
            const roleIds = this.inputRoleIds(n);
            const accIds = this.accountIdsOf(n);
            if (roleIds.length === 0 && accIds.length === 0)
                throw new common_1.BadRequestException(`第 ${i + 1} 个节点（${n.name}）请选择审批角色或审批人（可多选）`);
            if (roleIds.length > 10 || accIds.length > 10)
                throw new common_1.BadRequestException(`第 ${i + 1} 个节点（${n.name}）角色/审批人各最多选 10 个`);
            if (roleIds.length > 0 && (await this.prisma.role.count({ where: { id: { in: roleIds }, tenantId } })) !== roleIds.length)
                throw new common_1.BadRequestException(`第 ${i + 1} 个节点（${n.name}）选择的角色不存在，请重新选择`);
            if (accIds.length > 0 && (await this.prisma.account.count({ where: { id: { in: accIds }, tenantId, status: 'ACTIVE' } })) !== accIds.length)
                throw new common_1.BadRequestException(`第 ${i + 1} 个节点（${n.name}）选择的审批人里有已离职/停用的员工，请重新选择`);
        }
        const enabled = dto.enabled ?? latest.status === 'PUBLISHED';
        const created = await this.prisma.$transaction(async (tx) => {
            await tx.workflowDefinition.updateMany({ where: { tenantId, code }, data: { status: 'DISABLED' } });
            return tx.workflowDefinition.create({
                data: {
                    tenantId,
                    code,
                    name,
                    version: latest.version + 1,
                    status: enabled ? 'PUBLISHED' : 'DISABLED',
                    createdBy: this.ctx.accountId,
                    nodes: {
                        create: nodes.map((n, i) => ({
                            seq: i + 1,
                            name: n.name.trim(),
                            approverType: this.inputRoleIds(n).length > 0 ? 'ROLE' : 'ACCOUNT',
                            approverRoleId: this.inputRoleIds(n)[0] ?? null,
                            approverRoleIds: this.inputRoleIds(n).length > 0 ? this.inputRoleIds(n) : client_1.Prisma.JsonNull,
                            approverAccountId: this.accountIdsOf(n)[0] ?? null,
                            approverAccountIds: this.accountIdsOf(n).length > 0 ? this.accountIdsOf(n) : client_1.Prisma.JsonNull,
                            approvalMode: n.approvalMode,
                            timeoutHours: n.timeoutHours ?? null,
                        })),
                    },
                },
            });
        });
        await this.audit(created.id, `修改审批流程「${name}」：共 ${nodes.length} 个节点，新版本 v${created.version}`);
        return this.one(code);
    }
    async one(code) {
        return (await this.listForSettings()).find((d) => d.code === code);
    }
    audit(entityId, remark) {
        return this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'WorkflowDefinition',
            entityId,
            remark,
            tenantId: this.ctx.tenantId,
            storeId: this.ctx.homeStoreId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
    }
};
exports.WorkflowDefinitionService = WorkflowDefinitionService;
exports.WorkflowDefinitionService = WorkflowDefinitionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        request_context_service_1.RequestContextService,
        audit_log_service_1.AuditLogService])
], WorkflowDefinitionService);
//# sourceMappingURL=workflow-definition.service.js.map