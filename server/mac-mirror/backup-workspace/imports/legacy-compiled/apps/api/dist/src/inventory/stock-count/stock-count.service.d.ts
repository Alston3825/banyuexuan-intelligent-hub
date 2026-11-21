import { StockCount } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { WorkflowEngineService } from '../../workflow/workflow-engine/workflow-engine.service';
import { CreateStockCountDto } from './dto/create-stock-count.dto';
import { QueryStockCountDto } from './dto/query-stock-count.dto';
export declare class StockCountService {
    private readonly prisma;
    private readonly workflowEngineService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, workflowEngineService: WorkflowEngineService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryStockCountDto): Promise<StockCount[]>;
    findOneOrThrow(id: string): Promise<StockCount>;
    create(dto: CreateStockCountDto): Promise<StockCount>;
    submit(id: string, expectedVersion: number): Promise<StockCount>;
    cancel(id: string, cancelReason: string, expectedVersion: number): Promise<StockCount>;
    execute(id: string, expectedVersion: number): Promise<StockCount>;
    private reconcileStatus;
    private assertVersion;
    private actor;
    private auditCtx;
}
