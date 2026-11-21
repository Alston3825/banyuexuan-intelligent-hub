import { Device } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
export declare class DeviceService extends BaseScopedCrudService<Device> {
    private readonly prisma;
    private readonly dataScopeService;
    protected readonly entityType = "Device";
    constructor(prisma: PrismaService, dataScopeService: DataScopeService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(query?: {
        storeId?: string;
    }): Promise<Device[]>;
    create(data: {
        storeId: string;
        deviceTypeId: string;
        code: string;
        name: string;
        roomId?: string;
    }): Promise<Device>;
}
