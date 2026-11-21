import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { Application } from '@prisma/client';
export declare class ApplicationService extends BaseScopedCrudService<Application> {
    private readonly prisma;
    protected readonly entityType = "Application";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    create(data: {
        code: string;
        name: string;
        type: 'WEB' | 'MOBILE' | 'OPENAPI';
    }): Promise<Application>;
}
