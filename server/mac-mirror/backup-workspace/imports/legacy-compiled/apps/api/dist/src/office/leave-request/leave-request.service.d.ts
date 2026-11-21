import { LeaveRequest } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { WorkflowEngineService } from '../../workflow/workflow-engine/workflow-engine.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { QueryLeaveRequestDto } from './dto/query-leave-request.dto';
export declare class LeaveRequestService {
    private readonly prisma;
    private readonly workflowEngineService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, workflowEngineService: WorkflowEngineService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryLeaveRequestDto): Promise<LeaveRequest[]>;
    findOneOrThrow(id: string): Promise<LeaveRequest>;
    create(dto: CreateLeaveRequestDto): Promise<LeaveRequest>;
    submit(id: string, expectedVersion: number): Promise<LeaveRequest>;
    cancel(id: string, cancelReason: string, expectedVersion: number): Promise<LeaveRequest>;
    private reconcileStatus;
    private assertVersion;
    private actor;
    private auditCtx;
}
