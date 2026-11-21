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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngineService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const actor_context_1 = require("../../common/context/actor-context");
const queue_constants_1 = require("../../queue/queue.constants");
let WorkflowEngineService = class WorkflowEngineService {
    prisma;
    auditLogService;
    archiveQueue;
    constructor(prisma, auditLogService, archiveQueue) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.archiveQueue = archiveQueue;
    }
    async startInstance(params, actor) {
        const definition = await this.prisma.workflowDefinition.findFirst({
            where: { tenantId: actor.tenantId, code: params.definitionCode, status: 'PUBLISHED' },
            orderBy: { version: 'desc' },
            include: { nodes: { orderBy: { seq: 'asc' } } },
        });
        if (!definition) {
            throw new common_1.NotFoundException(`这类单据的审批流程已停用或还没设置，请联系管理员到“审批流程设置”里启用（${params.definitionCode}）`);
        }
        const first = definition.nodes[0];
        if (first) {
            const people = await this.resolveApprovers(this.nodeRoleIds(first), this.nodeAccountIds(first), params.storeId);
            if (people.length === 0) {
                throw new common_1.ConflictException(`审批流程「${definition.name}」的第一个节点「${first.name}」当前没有可审批的人（对应角色没有分配给任何在职员工），请联系管理员到“审批流程设置”里处理`);
            }
        }
        const instance = await this.prisma.workflowInstance.create({
            data: {
                tenantId: actor.tenantId,
                storeId: params.storeId,
                workflowDefinitionId: definition.id,
                businessType: params.businessType,
                businessId: params.businessId,
                title: params.title,
                status: 'SUBMITTED',
                initiatorId: actor.accountId,
                submittedAt: new Date(),
                createdBy: actor.accountId,
            },
        });
        await this.logAction(instance.id, null, 'SUBMIT', actor.accountId, undefined);
        await this.auditRecord('STATE_TRANSITION', instance.id, actor, { status: 'SUBMITTED' });
        const firstNode = definition.nodes[0];
        await this.advanceToNode(instance.id, firstNode?.seq ?? null, definition.id);
        return this.getInstanceOrThrow(instance.id);
    }
    async approve(instanceId, actor, comment) {
        const instance = await this.getInstanceOrThrow(instanceId);
        if (instance.status !== 'IN_REVIEW') {
            throw new common_1.ConflictException('当前状态不可审批');
        }
        const approverRow = await this.prisma.workflowInstanceApprover.findFirst({
            where: {
                workflowInstanceId: instanceId,
                nodeSeq: instance.currentNodeSeq ?? -1,
                accountId: actor.accountId,
                role: { in: ['APPROVER', 'ADDED_APPROVER'] },
                status: 'PENDING',
            },
        });
        if (!approverRow) {
            throw new common_1.ForbiddenException('您当前不是该审批节点的待审批人');
        }
        await this.prisma.workflowInstanceApprover.update({
            where: { id: approverRow.id },
            data: { status: 'APPROVED', comment, actedAt: new Date() },
        });
        await this.logAction(instanceId, instance.currentNodeSeq, 'APPROVE', actor.accountId, comment);
        await this.auditRecord('APPROVE', instanceId, actor, { nodeSeq: instance.currentNodeSeq });
        const currentNode = await this.prisma.workflowNode.findUnique({
            where: { workflowDefinitionId_seq: { workflowDefinitionId: instance.workflowDefinitionId, seq: instance.currentNodeSeq ?? -1 } },
        });
        if (currentNode?.approvalMode === 'ANY') {
            await this.prisma.workflowInstanceApprover.updateMany({
                where: { workflowInstanceId: instanceId, nodeSeq: instance.currentNodeSeq ?? -1, role: { in: ['APPROVER', 'ADDED_APPROVER'] }, status: 'PENDING' },
                data: { status: 'SKIPPED', actedAt: new Date() },
            });
        }
        const pendingCount = await this.prisma.workflowInstanceApprover.count({
            where: {
                workflowInstanceId: instanceId,
                nodeSeq: instance.currentNodeSeq ?? -1,
                role: { in: ['APPROVER', 'ADDED_APPROVER'] },
                status: 'PENDING',
            },
        });
        if (pendingCount > 0) {
            return this.getInstanceOrThrow(instanceId);
        }
        const definition = await this.prisma.workflowDefinition.findUnique({
            where: { id: instance.workflowDefinitionId },
            include: { nodes: { orderBy: { seq: 'asc' } } },
        });
        const nextNode = definition.nodes.find((n) => n.seq > (instance.currentNodeSeq ?? 0));
        if (nextNode) {
            await this.advanceToNode(instanceId, nextNode.seq, definition.id);
        }
        else {
            await this.finish(instanceId, 'APPROVED', actor);
        }
        return this.getInstanceOrThrow(instanceId);
    }
    async reject(instanceId, actor, comment) {
        const instance = await this.getInstanceOrThrow(instanceId);
        if (instance.status !== 'IN_REVIEW') {
            throw new common_1.ConflictException('当前状态不可驳回');
        }
        const approverRow = await this.prisma.workflowInstanceApprover.findFirst({
            where: {
                workflowInstanceId: instanceId,
                nodeSeq: instance.currentNodeSeq ?? -1,
                accountId: actor.accountId,
                role: { in: ['APPROVER', 'ADDED_APPROVER'] },
                status: 'PENDING',
            },
        });
        if (!approverRow) {
            throw new common_1.ForbiddenException('您当前不是该审批节点的待审批人');
        }
        await this.prisma.workflowInstanceApprover.update({
            where: { id: approverRow.id },
            data: { status: 'REJECTED', comment, actedAt: new Date() },
        });
        await this.logAction(instanceId, instance.currentNodeSeq, 'REJECT', actor.accountId, comment);
        await this.finish(instanceId, 'REJECTED', actor);
        await this.auditRecord('REJECT', instanceId, actor, { nodeSeq: instance.currentNodeSeq });
        return this.getInstanceOrThrow(instanceId);
    }
    async withdraw(instanceId, actor, comment) {
        const instance = await this.getInstanceOrThrow(instanceId);
        if (instance.initiatorId !== actor.accountId) {
            throw new common_1.ForbiddenException('仅发起人可撤回');
        }
        if (!['SUBMITTED', 'IN_REVIEW'].includes(instance.status)) {
            throw new common_1.ConflictException('当前状态不可撤回');
        }
        await this.finish(instanceId, 'WITHDRAWN', actor);
        await this.logAction(instanceId, instance.currentNodeSeq, 'WITHDRAW', actor.accountId, comment);
        await this.auditRecord('WITHDRAW', instanceId, actor, {});
        return this.getInstanceOrThrow(instanceId);
    }
    async reassign(instanceId, toAccountId, actor, comment, asAdmin = false) {
        const instance = await this.getInstanceOrThrow(instanceId);
        if (asAdmin && instance.status === 'IN_REVIEW') {
            const target = await this.prisma.account.findFirst({ where: { id: toAccountId, tenantId: instance.tenantId, status: 'ACTIVE' }, select: { id: true } });
            if (!target)
                throw new common_1.ConflictException('转交对象不存在或已停用');
            const pending = await this.prisma.workflowInstanceApprover.findMany({
                where: { workflowInstanceId: instanceId, nodeSeq: instance.currentNodeSeq ?? -1, role: { in: ['APPROVER', 'ADDED_APPROVER'] }, status: 'PENDING' },
            });
            await this.prisma.$transaction([
                this.prisma.workflowInstanceApprover.updateMany({ where: { id: { in: pending.map((p) => p.id) } }, data: { status: 'REASSIGNED', actedAt: new Date(), comment: comment ?? '管理员重新指定审批人' } }),
                this.prisma.workflowInstanceApprover.create({
                    data: { workflowInstanceId: instanceId, nodeSeq: instance.currentNodeSeq ?? 0, accountId: toAccountId, role: 'APPROVER', status: 'PENDING', reassignedFromId: pending[0]?.id },
                }),
            ]);
            await this.logAction(instanceId, instance.currentNodeSeq, 'REASSIGN', actor.accountId, comment ?? '管理员重新指定审批人');
            await this.auditRecord('REASSIGN', instanceId, actor, { toAccountId, byAdmin: true });
            return this.getInstanceOrThrow(instanceId);
        }
        const row = await this.prisma.workflowInstanceApprover.findFirst({
            where: {
                workflowInstanceId: instanceId,
                nodeSeq: instance.currentNodeSeq ?? -1,
                accountId: actor.accountId,
                status: 'PENDING',
            },
        });
        if (!row) {
            throw new common_1.ForbiddenException('转交人当前不是该节点待审批人');
        }
        await this.prisma.$transaction([
            this.prisma.workflowInstanceApprover.update({
                where: { id: row.id },
                data: { status: 'REASSIGNED', actedAt: new Date(), comment },
            }),
            this.prisma.workflowInstanceApprover.create({
                data: {
                    workflowInstanceId: instanceId,
                    nodeSeq: row.nodeSeq,
                    accountId: toAccountId,
                    role: row.role,
                    status: 'PENDING',
                    reassignedFromId: row.id,
                },
            }),
        ]);
        await this.logAction(instanceId, instance.currentNodeSeq, 'REASSIGN', actor.accountId, comment);
        await this.auditRecord('REASSIGN', instanceId, actor, { toAccountId });
        return this.getInstanceOrThrow(instanceId);
    }
    async addApprover(instanceId, accountId, actor, comment) {
        const instance = await this.getInstanceOrThrow(instanceId);
        if (instance.status !== 'IN_REVIEW') {
            throw new common_1.ConflictException('当前状态不可加签');
        }
        await this.prisma.workflowInstanceApprover.create({
            data: {
                workflowInstanceId: instanceId,
                nodeSeq: instance.currentNodeSeq ?? 0,
                accountId,
                role: 'ADDED_APPROVER',
                status: 'PENDING',
            },
        });
        await this.logAction(instanceId, instance.currentNodeSeq, 'ADD_APPROVER', actor.accountId, comment);
        await this.auditRecord('ADD_APPROVER', instanceId, actor, { accountId });
        return this.getInstanceOrThrow(instanceId);
    }
    async cc(instanceId, accountIds, actor) {
        const instance = await this.getInstanceOrThrow(instanceId);
        await this.prisma.workflowInstanceApprover.createMany({
            data: accountIds.map((accountId) => ({
                workflowInstanceId: instanceId,
                nodeSeq: instance.currentNodeSeq ?? 0,
                accountId,
                role: 'CC',
                status: 'NOTIFIED',
            })),
        });
        await this.logAction(instanceId, instance.currentNodeSeq, 'CC', actor.accountId);
        await this.auditRecord('CC', instanceId, actor, { accountIds });
        return this.getInstanceOrThrow(instanceId);
    }
    async urge(instanceId, actor, comment) {
        const instance = await this.getInstanceOrThrow(instanceId);
        if (instance.initiatorId !== actor.accountId)
            throw new common_1.ForbiddenException('只有发起人可以催办');
        if (instance.status !== 'IN_REVIEW')
            throw new common_1.ConflictException('这张单据当前不在审批中，不需要催办');
        const last = await this.prisma.workflowActionLog.findFirst({ where: { workflowInstanceId: instanceId, action: 'URGE' }, orderBy: { createdAt: 'desc' } });
        if (last && Date.now() - last.createdAt.getTime() < 3600_000)
            throw new common_1.ConflictException('刚催办过，请 1 小时后再催');
        await this.logAction(instanceId, instance.currentNodeSeq, 'URGE', actor.accountId, comment);
        return instance;
    }
    async archive(instanceId, actor = actor_context_1.SYSTEM_ACTOR) {
        const instance = await this.getInstanceOrThrow(instanceId);
        if (instance.status === 'ARCHIVED')
            return instance;
        const updated = await this.prisma.workflowInstance.update({
            where: { id: instanceId },
            data: { status: 'ARCHIVED' },
        });
        await this.logAction(instanceId, instance.currentNodeSeq, 'ARCHIVE', actor.accountId);
        await this.auditRecord('ARCHIVE', instanceId, actor, {});
        return updated;
    }
    async advanceToNode(instanceId, seq, definitionId) {
        if (seq === null) {
            await this.finish(instanceId, 'APPROVED', actor_context_1.SYSTEM_ACTOR);
            return;
        }
        const node = await this.prisma.workflowNode.findUnique({
            where: { workflowDefinitionId_seq: { workflowDefinitionId: definitionId, seq } },
        });
        if (!node) {
            await this.finish(instanceId, 'APPROVED', actor_context_1.SYSTEM_ACTOR);
            return;
        }
        const inst = await this.prisma.workflowInstance.findUnique({ where: { id: instanceId }, select: { storeId: true } });
        const approverAccountIds = await this.resolveApprovers(this.nodeRoleIds(node), this.nodeAccountIds(node), inst?.storeId);
        if (approverAccountIds.length === 0) {
            const nextNode = await this.prisma.workflowNode.findFirst({ where: { workflowDefinitionId: definitionId, seq: { gt: seq } }, orderBy: { seq: 'asc' } });
            await this.logAction(instanceId, seq, 'APPROVE', 'SYSTEM', `节点「${node.name}」没有可审批的人，系统自动跳过`);
            await this.advanceToNode(instanceId, nextNode?.seq ?? null, definitionId);
            return;
        }
        await this.prisma.$transaction([
            this.prisma.workflowInstance.update({
                where: { id: instanceId },
                data: { status: 'IN_REVIEW', currentNodeSeq: seq },
            }),
            ...approverAccountIds.map((accountId) => this.prisma.workflowInstanceApprover.create({
                data: { workflowInstanceId: instanceId, nodeSeq: seq, accountId, role: 'APPROVER', status: 'PENDING' },
            })),
        ]);
    }
    nodeAccountIds(n) {
        const arr = Array.isArray(n.approverAccountIds) ? n.approverAccountIds.filter((x) => typeof x === 'string') : [];
        return arr.length > 0 ? arr : n.approverAccountId ? [n.approverAccountId] : [];
    }
    nodeRoleIds(n) {
        const arr = Array.isArray(n.approverRoleIds) ? n.approverRoleIds.filter((x) => typeof x === 'string') : [];
        return arr.length > 0 ? arr : n.approverType === 'ROLE' && n.approverRoleId ? [n.approverRoleId] : [];
    }
    async resolveApprovers(roleIds, approverAccountIds, storeId) {
        const out = new Set();
        if (approverAccountIds.length > 0) {
            const accs = await this.prisma.account.findMany({ where: { id: { in: approverAccountIds }, status: 'ACTIVE' }, select: { id: true } });
            accs.forEach((a) => out.add(a.id));
        }
        const store = storeId ? await this.prisma.store.findUnique({ where: { id: storeId }, select: { regionId: true } }) : null;
        for (const roleId of roleIds) {
            const assignments = await this.prisma.accountRoleAssignment.findMany({
                where: { roleId, revokedAt: null, account: { status: 'ACTIVE' } },
                select: { accountId: true, scopeType: true, scopeId: true, account: { select: { storeId: true } } },
            });
            let matched = assignments;
            if (storeId) {
                const local = assignments.filter((a) => a.account.storeId === storeId || (a.scopeType === 'STORE' && a.scopeId === storeId));
                const covering = assignments.filter((a) => a.scopeType === 'TENANT' || (a.scopeType === 'REGION' && !!store && a.scopeId === store.regionId));
                const hq = assignments.filter((a) => !a.account.storeId);
                matched = local.length > 0 ? local : covering.length > 0 ? covering : hq.length > 0 ? hq : assignments;
            }
            matched.forEach((a) => out.add(a.accountId));
        }
        return [...out];
    }
    async finish(instanceId, status, actor) {
        await this.prisma.workflowInstance.update({
            where: { id: instanceId },
            data: { status, finishedAt: new Date() },
        });
        if (status === 'APPROVED') {
            const delaySeconds = await this.getArchiveDelaySeconds(actor.tenantId);
            await this.archiveQueue.add('archive', { instanceId }, { delay: delaySeconds * 1000 });
        }
    }
    async getArchiveDelaySeconds(tenantId) {
        const param = await this.prisma.parameter.findFirst({
            where: { tenantId: tenantId ?? undefined, storeId: null, key: 'workflow.archive_delay_seconds' },
        });
        return param ? Number(param.value) : 60;
    }
    async getInstanceOrThrow(id) {
        const instance = await this.prisma.workflowInstance.findUnique({ where: { id } });
        if (!instance)
            throw new common_1.NotFoundException(`WorkflowInstance ${id} 不存在`);
        return instance;
    }
    async logAction(instanceId, nodeSeq, action, actorId, comment) {
        await this.prisma.workflowActionLog.create({
            data: { workflowInstanceId: instanceId, nodeSeq: nodeSeq ?? null, actorId: actorId ?? 'SYSTEM', action, comment },
        });
    }
    async auditRecord(action, instanceId, actor, extra) {
        await this.auditLogService.record({
            action,
            entityType: 'WorkflowInstance',
            entityId: instanceId,
            afterData: extra,
            tenantId: actor.tenantId,
            storeId: actor.storeId,
            accountId: actor.accountId,
            ip: actor.ip,
            userAgent: actor.userAgent,
            requestId: actor.requestId,
        });
    }
};
exports.WorkflowEngineService = WorkflowEngineService;
exports.WorkflowEngineService = WorkflowEngineService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)(queue_constants_1.WORKFLOW_ARCHIVE_QUEUE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService, typeof (_a = typeof bullmq_2.Queue !== "undefined" && bullmq_2.Queue) === "function" ? _a : Object])
], WorkflowEngineService);
//# sourceMappingURL=workflow-engine.service.js.map