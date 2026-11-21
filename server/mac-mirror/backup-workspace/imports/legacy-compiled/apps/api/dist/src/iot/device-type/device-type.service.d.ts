import { DeviceType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
export declare class DeviceTypeService extends BaseScopedCrudService<DeviceType> {
    private readonly prisma;
    protected readonly entityType = "DeviceType";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(): Promise<DeviceType[]>;
    create(data: {
        category: DeviceType['category'];
        name: string;
        protocol: string;
        requiresCommandConfirmation?: boolean;
    }): Promise<T>;
}
