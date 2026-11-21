import { Supplier } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
export declare class SupplierService extends BaseScopedCrudService<Supplier> {
    private readonly prisma;
    protected readonly entityType = "Supplier";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(): Promise<Supplier[]>;
    create(data: {
        code: string;
        name: string;
        contactName?: string;
        phone?: string;
        remark?: string;
    }): Promise<T>;
}
