import { MealItem, MealSlot } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
export declare class MealItemService extends BaseScopedCrudService<MealItem> {
    private readonly prisma;
    protected readonly entityType = "MealItem";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(): Promise<MealItem[]>;
    create(data: {
        code: string;
        name: string;
        defaultSlot: MealSlot;
        ingredientTags?: unknown;
    }): Promise<T>;
}
