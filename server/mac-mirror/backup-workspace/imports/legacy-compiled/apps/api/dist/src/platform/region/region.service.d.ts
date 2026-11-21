import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { Region } from '@prisma/client';
export declare class RegionService extends BaseScopedCrudService<Region> {
    private readonly prisma;
    protected readonly entityType = "Region";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    create(data: {
        code?: string;
        name: string;
    }): Promise<Region>;
}
