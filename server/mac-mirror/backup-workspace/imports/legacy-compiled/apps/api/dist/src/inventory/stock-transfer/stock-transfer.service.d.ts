import { StockTransfer } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { WorkflowEngineService } from '../../workflow/workflow-engine/workflow-engine.service';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { QueryStockTransferDto } from './dto/query-stock-transfer.dto';
export declare class StockTransferService {
    private readonly prisma;
    private readonly workflowEngineService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, workflowEngineService: WorkflowEngineService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryStockTransferDto): Promise<StockTransfer[]>;
    findOneOrThrow(id: string): Promise<StockTransfer>;
    create(dto: CreateStockTransferDto): Promise<StockTransfer>;
    submit(id: string, expectedVersion: number): Promise<StockTransfer>;
    cancel(id: string, cancelReason: string, expectedVersion: number): Promise<StockTransfer>;
    execute(id: string, expectedVersion: number): Promise<StockTransfer>;
    private reconcileStatus;
    private assertVersion;
    private actor;
    private auditCtx;
}
