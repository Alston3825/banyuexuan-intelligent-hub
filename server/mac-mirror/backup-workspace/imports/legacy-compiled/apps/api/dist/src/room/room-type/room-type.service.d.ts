import { RoomType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
export declare class RoomTypeService extends BaseScopedCrudService<RoomType> {
    private readonly prisma;
    protected readonly entityType = "RoomType";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(): Promise<RoomType[]>;
    create(data: {
        code: string;
        name: string;
        description?: string;
        standardPrice?: number;
    }): Promise<RoomType>;
}
