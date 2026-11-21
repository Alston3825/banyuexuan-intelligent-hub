import { ShiftDefinition } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { QueryShiftDefinitionDto } from './dto/query-shift-definition.dto';
export declare class ShiftDefinitionService extends BaseScopedCrudService<ShiftDefinition> {
    private readonly prisma;
    protected readonly entityType = "ShiftDefinition";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(query?: QueryShiftDefinitionDto): Promise<ShiftDefinition[]>;
    create(data: {
        storeId: string;
        code: string;
        name: string;
        startTime: string;
        endTime: string;
    }): Promise<T>;
}
