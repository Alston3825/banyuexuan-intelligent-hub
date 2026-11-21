import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { Team } from '@prisma/client';
export declare class TeamService extends BaseScopedCrudService<Team> {
    private readonly prisma;
    private readonly dataScopeService;
    protected readonly entityType = "Team";
    constructor(prisma: PrismaService, dataScopeService: DataScopeService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    create(data: {
        code?: string;
        name: string;
        departmentId: string;
    }): Promise<Team>;
}
