import { DietaryRestriction, DietaryRestrictionCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
export declare class DietaryRestrictionService extends BaseScopedCrudService<DietaryRestriction> {
    private readonly prisma;
    protected readonly entityType = "DietaryRestriction";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(): Promise<DietaryRestriction[]>;
    create(data: {
        code: string;
        name: string;
        category: DietaryRestrictionCategory;
    }): Promise<T>;
}
