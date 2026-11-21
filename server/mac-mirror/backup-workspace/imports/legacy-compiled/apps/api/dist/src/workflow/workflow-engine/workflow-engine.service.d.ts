import { Queue } from 'bullmq';
import { WorkflowInstance } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { ActorContext } from '../../common/context/actor-context';
export interface StartInstanceParams {
    definitionCode: string;
    businessType: string;
    businessId: string;
    title: string;
    storeId?: string | null;
}
export declare class WorkflowEngineService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly archiveQueue;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, archiveQueue: Queue);
    startInstance(params: StartInstanceParams, actor: ActorContext): Promise<WorkflowInstance>;
    approve(instanceId: string, actor: ActorContext, comment?: string): Promise<WorkflowInstance>;
    reject(instanceId: string, actor: ActorContext, comment?: string): Promise<WorkflowInstance>;
    withdraw(instanceId: string, actor: ActorContext, comment?: string): Promise<WorkflowInstance>;
    reassign(instanceId: string, toAccountId: string, actor: ActorContext, comment?: string, asAdmin?: boolean): Promise<WorkflowInstance>;
    addApprover(instanceId: string, accountId: string, actor: ActorContext, comment?: string): Promise<WorkflowInstance>;
    cc(instanceId: string, accountIds: string[], actor: ActorContext): Promise<WorkflowInstance>;
    urge(instanceId: string, actor: ActorContext, comment?: string): Promise<WorkflowInstance>;
    archive(instanceId: string, actor?: ActorContext): Promise<WorkflowInstance>;
    private advanceToNode;
    private nodeAccountIds;
    private nodeRoleIds;
    private resolveApprovers;
    private finish;
    private getArchiveDelaySeconds;
    private getInstanceOrThrow;
    private logAction;
    private auditRecord;
}
