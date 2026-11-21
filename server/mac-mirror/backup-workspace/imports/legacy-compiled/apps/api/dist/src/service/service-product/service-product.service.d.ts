import { ServiceProduct } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
export declare class ServiceProductService extends BaseScopedCrudService<ServiceProduct> {
    private readonly prisma;
    protected readonly entityType = "ServiceProduct";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(): Promise<ServiceProduct[]>;
    create(data: {
        code: string;
        name: string;
        durationMinutes?: number;
        unitPrice?: number;
    }): Promise<T>;
}
