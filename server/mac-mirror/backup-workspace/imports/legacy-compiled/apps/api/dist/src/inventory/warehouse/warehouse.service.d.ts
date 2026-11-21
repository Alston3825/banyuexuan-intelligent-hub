import { Warehouse, WarehousePurpose } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { QueryWarehouseDto } from './dto/query-warehouse.dto';
export declare class WarehouseService extends BaseScopedCrudService<Warehouse> {
    private readonly prisma;
    protected readonly entityType = "Warehouse";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(query?: QueryWarehouseDto): Promise<Warehouse[]>;
    create(data: {
        storeId: string;
        code: string;
        name: string;
        purpose?: WarehousePurpose;
        requiresApproval?: boolean;
    }): Promise<T>;
}
