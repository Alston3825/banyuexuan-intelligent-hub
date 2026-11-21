import { PrismaService } from '../../prisma/prisma.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { AuditLogService } from '../../audit/audit-log.service';
export declare class WorkflowNodeInput {
    name: string;
    approverType: 'ROLE' | 'ACCOUNT';
    approverRoleId?: string;
    approverRoleIds?: string[];
    approverAccountId?: string;
    approverAccountIds?: string[];
    approvalMode: 'ALL' | 'ANY';
    timeoutHours?: number | null;
}
export declare class SaveWorkflowDefinitionDto {
    name?: string;
    enabled?: boolean;
    nodes?: WorkflowNodeInput[];
}
export declare class WorkflowDefinitionService {
    private readonly prisma;
    private readonly ctx;
    private readonly auditLogService;
    constructor(prisma: PrismaService, ctx: RequestContextService, auditLogService: AuditLogService);
    findMany(): any;
    listForSettings(): unknown;
    private accountIdsOf;
    private inputRoleIds;
    private roleIdsOf;
    private idsOf;
    save(code: string, dto: SaveWorkflowDefinitionDto): unknown;
    private one;
    private audit;
}
