import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { Tag } from '@prisma/client';
export declare class TagService extends BaseScopedCrudService<Tag> {
    private readonly prisma;
    protected readonly entityType = "Tag";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    create(data: {
        name: string;
        color?: string;
        category?: string;
    }): Promise<Tag>;
    bind(tagId: string, entityType: string, entityId: string): unknown;
    unbind(bindingId: string): unknown;
    listByCategory(category: string): any;
    listActiveBindings(entityType: string, entityId: string): any;
    listBindingHistory(entityType: string, entityId: string, category?: string): any;
    setExclusiveTag(entityType: string, entityId: string, category: string, newTagId: string): unknown;
    private bindingAuditCtx;
}
