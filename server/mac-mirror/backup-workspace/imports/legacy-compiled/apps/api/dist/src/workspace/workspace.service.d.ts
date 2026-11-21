import { PrismaService } from '../prisma/prisma.service';
import { RequestContextService } from '../common/context/request-context.service';
import { DataScopeService } from '../common/scope/data-scope.service';
import { WorkflowQueryService } from '../workflow/workflow-engine/workflow-query.service';
export type TodoKind = 'APPROVAL' | 'REJECTED' | 'EXPIRY' | 'OUTREACH' | 'COLLECT' | 'PURCHASE' | 'RECEIVE' | 'ROOM_CONFLICT' | 'SATISFACTION';
export type TodoLevel = 'danger' | 'warning' | 'info';
export interface TodoItem {
    key: string;
    kind: TodoKind;
    title: string;
    desc: string;
    link: string;
    dueAt: Date | null;
    overdue: boolean;
    level: TodoLevel;
    sortAt: number;
}
export declare class WorkspaceService {
    private readonly prisma;
    private readonly ctx;
    private readonly dataScope;
    private readonly workflowQuery;
    constructor(prisma: PrismaService, ctx: RequestContextService, dataScope: DataScopeService, workflowQuery: WorkflowQueryService);
    todos(): unknown;
    private healthCertTodos;
    private procurementTodos;
    private roomConflictTodos;
    private satisfactionTodos;
    badge(): unknown;
}
