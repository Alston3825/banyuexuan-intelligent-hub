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
exports.WorkflowQueryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const workflow_business_1 = require("./workflow-business");
const HOUR = 3600_000;
let WorkflowQueryService = class WorkflowQueryService {
    prisma;
    ctx;
    constructor(prisma, ctx) {
        this.prisma = prisma;
        this.ctx = ctx;
    }
    async names(ids) {
        const unique = [...new Set(ids.filter((i) => i && i !== 'SYSTEM'))];
        if (unique.length === 0)
            return new Map();
        const rows = await this.prisma.account.findMany({ where: { id: { in: unique } }, select: { id: true, realName: true } });
        return new Map(rows.map((r) => [r.id, r.realName]));
    }
    async progress(instanceId) {
        const instance = await this.prisma.workflowInstance.findFirst({
            where: { id: instanceId, tenantId: this.ctx.tenantId },
            include: {
                definition: { include: { nodes: { orderBy: { seq: 'asc' } } } },
                approvers: { orderBy: [{ nodeSeq: 'asc' }, { createdAt: 'asc' }] },
                actions: { orderBy: { createdAt: 'asc' } },
            },
        });
        if (!instance)
            throw new common_1.NotFoundException('审批单不存在');
        const rolesOf = (n) => (Array.isArray(n.approverRoleIds) && n.approverRoleIds.length > 0 ? n.approverRoleIds : n.approverRoleId ? [n.approverRoleId] : []);
        const acctsOf = (n) => (Array.isArray(n.approverAccountIds) && n.approverAccountIds.length > 0 ? n.approverAccountIds : n.approverAccountId ? [n.approverAccountId] : []);
        const roleIds = instance.definition.nodes.flatMap((n) => rolesOf(n));
        const roles = roleIds.length ? await this.prisma.role.findMany({ where: { id: { in: roleIds } }, select: { id: true, name: true } }) : [];
        const roleName = new Map(roles.map((r) => [r.id, r.name]));
        const nameOf = await this.names([
            instance.initiatorId,
            ...instance.approvers.map((a) => a.accountId),
            ...instance.actions.map((a) => a.actorId),
            ...instance.definition.nodes.flatMap((n) => acctsOf(n)),
        ]);
        const me = this.ctx.accountId;
        const now = Date.now();
        const active = instance.status === 'IN_REVIEW';
        const cur = instance.currentNodeSeq ?? -1;
        const nodes = instance.definition.nodes.map((n) => {
            const rows = instance.approvers.filter((a) => a.nodeSeq === n.seq && a.role !== 'CC');
            let state = 'WAITING';
            if (['APPROVED', 'ARCHIVED'].includes(instance.status))
                state = rows.length ? 'DONE' : 'SKIPPED';
            else if (instance.status === 'REJECTED')
                state = n.seq < cur ? 'DONE' : n.seq === cur ? 'REJECTED' : 'WAITING';
            else if (instance.status === 'WITHDRAWN')
                state = n.seq < cur ? 'DONE' : n.seq === cur ? 'WITHDRAWN' : 'WAITING';
            else if (active)
                state = n.seq < cur ? 'DONE' : n.seq === cur ? 'CURRENT' : 'WAITING';
            const plannedParts = [
                ...(rolesOf(n).length > 0 ? [`角色：${rolesOf(n).map((id) => roleName.get(id) ?? '（角色已删除）').join('、')}`] : []),
                ...(acctsOf(n).length > 0 ? [`指定：${acctsOf(n).map((id) => nameOf.get(id) ?? '某位员工').join('、')}`] : []),
            ];
            const planned = plannedParts.join('；') || '（未设置）';
            return {
                seq: n.seq,
                name: n.name,
                mode: n.approvalMode,
                timeoutHours: n.timeoutHours,
                state,
                planned,
                approvers: rows.map((a) => {
                    const dueAt = a.status === 'PENDING' && n.timeoutHours ? new Date(a.createdAt.getTime() + n.timeoutHours * HOUR) : null;
                    return {
                        accountId: a.accountId,
                        name: nameOf.get(a.accountId) ?? a.accountId,
                        role: a.role,
                        status: a.status,
                        comment: a.comment,
                        actedAt: a.actedAt,
                        arrivedAt: a.createdAt,
                        dueAt,
                        overdue: !!dueAt && dueAt.getTime() < now,
                    };
                }),
            };
        });
        const urges = instance.actions.filter((a) => a.action === 'URGE');
        const pendingMine = active && instance.approvers.some((a) => a.accountId === me && a.nodeSeq === cur && a.status === 'PENDING' && a.role !== 'CC');
        return {
            id: instance.id,
            title: instance.title,
            status: instance.status,
            businessType: instance.businessType,
            businessLabel: (0, workflow_business_1.businessLabel)(instance.businessType),
            businessId: instance.businessId,
            businessPath: (0, workflow_business_1.businessPath)(instance.businessType),
            definitionName: instance.definition.name,
            submittedAt: instance.submittedAt,
            finishedAt: instance.finishedAt,
            currentNodeSeq: instance.currentNodeSeq,
            initiator: { id: instance.initiatorId, name: nameOf.get(instance.initiatorId) ?? instance.initiatorId },
            nodes,
            ccs: instance.approvers.filter((a) => a.role === 'CC').map((a) => ({ accountId: a.accountId, name: nameOf.get(a.accountId) ?? a.accountId })),
            actions: instance.actions.map((a) => ({ id: a.id, action: a.action, nodeSeq: a.nodeSeq, comment: a.comment, createdAt: a.createdAt, actorId: a.actorId, actorName: a.actorId === 'SYSTEM' ? '系统' : nameOf.get(a.actorId) ?? a.actorId })),
            urgeCount: urges.length,
            lastUrgedAt: urges.length ? urges[urges.length - 1].createdAt : null,
            me: {
                canApprove: pendingMine,
                canWithdraw: instance.initiatorId === me && ['SUBMITTED', 'IN_REVIEW'].includes(instance.status),
                canUrge: instance.initiatorId === me && active,
                canReassignAsAdmin: active && (await this.ctx.hasPermission('workflow.definition.update')),
            },
        };
    }
    async instanceIdByBusiness(businessType, businessId) {
        const row = await this.prisma.workflowInstance.findFirst({
            where: { tenantId: this.ctx.tenantId, businessType, businessId },
            orderBy: { createdAt: 'desc' },
            select: { id: true },
        });
        return row?.id ?? null;
    }
    async pendingForMe(limit = 200) {
        const me = this.ctx.accountId;
        const rows = await this.prisma.workflowInstanceApprover.findMany({
            where: { accountId: me, status: 'PENDING', role: { in: ['APPROVER', 'ADDED_APPROVER'] }, instance: { tenantId: this.ctx.tenantId, status: 'IN_REVIEW' } },
            include: { instance: { include: { definition: { include: { nodes: true } }, actions: { where: { action: 'URGE' }, select: { nodeSeq: true } } } } },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
        const current = rows.filter((r) => r.nodeSeq === r.instance.currentNodeSeq);
        const nameOf = await this.names(current.map((r) => r.instance.initiatorId));
        const now = Date.now();
        return current.map((r) => {
            const node = r.instance.definition.nodes.find((n) => n.seq === r.nodeSeq);
            const dueAt = node?.timeoutHours ? new Date(r.createdAt.getTime() + node.timeoutHours * HOUR) : null;
            return {
                instanceId: r.workflowInstanceId,
                title: r.instance.title,
                businessType: r.instance.businessType,
                businessLabel: (0, workflow_business_1.businessLabel)(r.instance.businessType),
                initiatorName: nameOf.get(r.instance.initiatorId) ?? '',
                nodeName: node?.name ?? '',
                arrivedAt: r.createdAt,
                dueAt,
                overdue: !!dueAt && dueAt.getTime() < now,
                urgeCount: r.instance.actions.filter((a) => a.nodeSeq === r.nodeSeq).length,
            };
        });
    }
    async approvals(tab, keyword) {
        const me = this.ctx.accountId;
        const kw = keyword?.trim();
        const titleFilter = kw ? { title: { contains: kw } } : {};
        const tenantId = this.ctx.tenantId;
        if (tab === 'pending') {
            const list = await this.pendingForMe();
            return list.filter((r) => !kw || r.title.includes(kw) || r.businessLabel.includes(kw)).map((r) => ({ ...r, status: 'IN_REVIEW' }));
        }
        if (tab === 'mine') {
            const rows = await this.prisma.workflowInstance.findMany({
                where: { tenantId, initiatorId: me, ...titleFilter },
                orderBy: { createdAt: 'desc' },
                take: 200,
                include: { definition: { include: { nodes: true } }, approvers: { where: { status: 'PENDING', role: { in: ['APPROVER', 'ADDED_APPROVER'] } } }, actions: { where: { action: 'URGE' }, select: { id: true } } },
            });
            const nameOf = await this.names(rows.flatMap((r) => r.approvers.map((a) => a.accountId)));
            return rows.map((r) => {
                const node = r.definition.nodes.find((n) => n.seq === r.currentNodeSeq);
                const waiting = r.status === 'IN_REVIEW' ? r.approvers.filter((a) => a.nodeSeq === r.currentNodeSeq) : [];
                const earliest = waiting.length ? Math.min(...waiting.map((a) => a.createdAt.getTime())) : null;
                const dueAt = earliest && node?.timeoutHours ? new Date(earliest + node.timeoutHours * HOUR) : null;
                return {
                    instanceId: r.id,
                    title: r.title,
                    businessType: r.businessType,
                    businessLabel: (0, workflow_business_1.businessLabel)(r.businessType),
                    status: r.status,
                    submittedAt: r.submittedAt,
                    finishedAt: r.finishedAt,
                    nodeName: r.status === 'IN_REVIEW' ? node?.name ?? '' : '',
                    waitingFor: waiting.map((a) => nameOf.get(a.accountId) ?? '').filter(Boolean),
                    dueAt,
                    overdue: !!dueAt && dueAt.getTime() < Date.now(),
                    urgeCount: r.actions.length,
                };
            });
        }
        const rows = await this.prisma.workflowInstanceApprover.findMany({
            where: tab === 'done'
                ? { accountId: me, status: { in: ['APPROVED', 'REJECTED'] }, instance: { tenantId, ...titleFilter } }
                : { accountId: me, role: 'CC', instance: { tenantId, ...titleFilter } },
            orderBy: { updatedAt: 'desc' },
            take: 200,
            include: { instance: true },
        });
        const nameOf = await this.names(rows.map((r) => r.instance.initiatorId));
        const seen = new Set();
        return rows
            .filter((r) => (seen.has(r.workflowInstanceId) ? false : (seen.add(r.workflowInstanceId), true)))
            .map((r) => ({
            instanceId: r.workflowInstanceId,
            title: r.instance.title,
            businessType: r.instance.businessType,
            businessLabel: (0, workflow_business_1.businessLabel)(r.instance.businessType),
            status: r.instance.status,
            initiatorName: nameOf.get(r.instance.initiatorId) ?? '',
            submittedAt: r.instance.submittedAt,
            myStatus: r.status,
            myComment: r.comment,
            actedAt: r.actedAt,
        }));
    }
};
exports.WorkflowQueryService = WorkflowQueryService;
exports.WorkflowQueryService = WorkflowQueryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        request_context_service_1.RequestContextService])
], WorkflowQueryService);
//# sourceMappingURL=workflow-query.service.js.map