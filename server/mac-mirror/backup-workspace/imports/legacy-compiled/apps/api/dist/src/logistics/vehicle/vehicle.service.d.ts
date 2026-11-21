import { Vehicle } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
export declare class VehicleService extends BaseScopedCrudService<Vehicle> {
    private readonly prisma;
    protected readonly entityType = "Vehicle";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(): Promise<Vehicle[]>;
    create(data: {
        plateNumber: string;
        model: string;
        remark?: string;
    }): Promise<T>;
}
