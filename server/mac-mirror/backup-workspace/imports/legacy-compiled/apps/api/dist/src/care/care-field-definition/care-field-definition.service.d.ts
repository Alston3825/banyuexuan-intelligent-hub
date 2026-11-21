import { CareFieldControlType, CareFieldDefinition, CareTargetType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { QueryCareFieldDefinitionDto } from './dto/query-care-field-definition.dto';
export declare class CareFieldDefinitionService extends BaseScopedCrudService<CareFieldDefinition> {
    private readonly prisma;
    protected readonly entityType = "CareFieldDefinition";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(query?: QueryCareFieldDefinitionDto): Promise<CareFieldDefinition[]>;
    create(data: {
        code: string;
        name: string;
        targetType: CareTargetType;
        controlType: CareFieldControlType;
        unit?: string;
        options?: unknown;
        normalMin?: number;
        normalMax?: number;
        normalOptionValues?: unknown;
        visibleToClient?: boolean;
    }): Promise<CareFieldDefinition>;
}
