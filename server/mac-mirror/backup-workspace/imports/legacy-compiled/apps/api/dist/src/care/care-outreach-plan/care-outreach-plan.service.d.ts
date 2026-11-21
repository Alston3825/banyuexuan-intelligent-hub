import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
import { CreateCareOutreachPlanDto } from './dto/create-care-outreach-plan.dto';
import { QueryCareOutreachPlanDto } from './dto/query-care-outreach-plan.dto';
import { CompleteCareOutreachTaskDto } from './dto/complete-care-outreach-task.dto';
export declare class CareOutreachPlanService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    private readonly dataScopeService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService, dataScopeService: DataScopeService);
    findMany(query?: QueryCareOutreachPlanDto): import(".prisma/client").Prisma.PrismaPromise<{}>;
    findOneOrThrow(id: string): unknown;
    findPendingTasks(): unknown;
    create(dto: CreateCareOutreachPlanDto): unknown;
    terminate(id: string, reason: string, expectedVersion: number): unknown;
    completeTask(taskId: string, dto: CompleteCareOutreachTaskDto): unknown;
    private auditCtx;
}
