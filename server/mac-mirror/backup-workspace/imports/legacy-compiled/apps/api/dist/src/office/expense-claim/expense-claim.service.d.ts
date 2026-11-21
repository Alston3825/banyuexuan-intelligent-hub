import { ExpenseClaim } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { WorkflowEngineService } from '../../workflow/workflow-engine/workflow-engine.service';
import { CreateExpenseClaimDto } from './dto/create-expense-claim.dto';
import { QueryExpenseClaimDto } from './dto/query-expense-claim.dto';
export declare class ExpenseClaimService {
    private readonly prisma;
    private readonly workflowEngineService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, workflowEngineService: WorkflowEngineService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryExpenseClaimDto): Promise<ExpenseClaim[]>;
    findOneOrThrow(id: string): Promise<ExpenseClaim>;
    create(dto: CreateExpenseClaimDto): Promise<ExpenseClaim>;
    submit(id: string, expectedVersion: number): Promise<ExpenseClaim>;
    cancel(id: string, cancelReason: string, expectedVersion: number): Promise<ExpenseClaim>;
    private reconcileStatus;
    private assertVersion;
    private actor;
    private auditCtx;
}
