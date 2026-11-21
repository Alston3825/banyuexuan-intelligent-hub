import { PayrollRecord } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { WorkflowEngineService } from '../../workflow/workflow-engine/workflow-engine.service';
import { CreatePayrollRecordDto } from './dto/create-payroll-record.dto';
import { QueryPayrollRecordDto } from './dto/query-payroll-record.dto';
export declare class PayrollRecordService {
    private readonly prisma;
    private readonly workflowEngineService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, workflowEngineService: WorkflowEngineService, auditLogService: AuditLogService, ctx: RequestContextService);
    private scopeFilter;
    findMany(query?: QueryPayrollRecordDto): Promise<PayrollRecord[]>;
    findOneOrThrow(id: string): Promise<PayrollRecord>;
    create(dto: CreatePayrollRecordDto): Promise<PayrollRecord>;
    submit(id: string, expectedVersion: number): Promise<PayrollRecord>;
    markPaid(id: string, expectedVersion: number): Promise<PayrollRecord>;
    cancel(id: string, cancelReason: string, expectedVersion: number): Promise<PayrollRecord>;
    private reconcileStatus;
    private assertVersion;
    private actor;
    private auditCtx;
}
