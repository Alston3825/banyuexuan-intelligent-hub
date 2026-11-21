import { StockIssue } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { WorkflowEngineService } from '../../workflow/workflow-engine/workflow-engine.service';
import { CreateStockIssueDto } from './dto/create-stock-issue.dto';
import { QueryStockIssueDto } from './dto/query-stock-issue.dto';
export declare class StockIssueService {
    private readonly prisma;
    private readonly workflowEngineService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, workflowEngineService: WorkflowEngineService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryStockIssueDto): Promise<StockIssue[]>;
    findOneOrThrow(id: string): Promise<StockIssue>;
    create(dto: CreateStockIssueDto): Promise<StockIssue>;
    submit(id: string, expectedVersion: number): Promise<StockIssue>;
    cancel(id: string, cancelReason: string, expectedVersion: number): Promise<StockIssue>;
    execute(id: string, expectedVersion: number): Promise<StockIssue>;
    private reconcileStatus;
    private assertVersion;
    private actor;
    private auditCtx;
}
