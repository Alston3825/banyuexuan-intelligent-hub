import { CommissionRecord } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { WorkflowEngineService } from '../../workflow/workflow-engine/workflow-engine.service';
import { CreateCommissionRecordDto } from './dto/create-commission-record.dto';
import { QueryCommissionRecordDto } from './dto/query-commission-record.dto';
export declare class CommissionRecordService {
    private readonly prisma;
    private readonly workflowEngineService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, workflowEngineService: WorkflowEngineService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryCommissionRecordDto): Promise<CommissionRecord[]>;
    findOneOrThrow(id: string): Promise<CommissionRecord>;
    create(dto: CreateCommissionRecordDto): Promise<CommissionRecord>;
    submit(id: string, expectedVersion: number): Promise<CommissionRecord>;
    cancel(id: string, cancelReason: string, expectedVersion: number): Promise<CommissionRecord>;
    private reconcileStatus;
    private assertVersion;
    private actor;
    private auditCtx;
}
