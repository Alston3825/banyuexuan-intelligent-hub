import { GeneralMemo } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { WorkflowEngineService } from '../../workflow/workflow-engine/workflow-engine.service';
import { CreateGeneralMemoDto } from './dto/create-general-memo.dto';
import { QueryGeneralMemoDto } from './dto/query-general-memo.dto';
export declare class GeneralMemoService {
    private readonly prisma;
    private readonly workflowEngineService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, workflowEngineService: WorkflowEngineService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryGeneralMemoDto): Promise<GeneralMemo[]>;
    findOneOrThrow(id: string): Promise<GeneralMemo>;
    create(dto: CreateGeneralMemoDto): Promise<GeneralMemo>;
    submit(id: string, expectedVersion: number): Promise<GeneralMemo>;
    cancel(id: string, cancelReason: string, expectedVersion: number): Promise<GeneralMemo>;
    private reconcileStatus;
    private assertVersion;
    private actor;
    private auditCtx;
}
