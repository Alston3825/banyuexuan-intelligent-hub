import { ServicePackage } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
export declare class ServicePackageService extends BaseScopedCrudService<ServicePackage> {
    private readonly prisma;
    protected readonly entityType = "ServicePackage";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(): Promise<ServicePackage[]>;
    create(data: {
        code: string;
        name: string;
        totalSessions: number;
        price: number;
    }): Promise<T>;
}
