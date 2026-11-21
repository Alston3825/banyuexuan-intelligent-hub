import { InventoryItem, WarehousePurpose } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
export declare class InventoryItemService extends BaseScopedCrudService<InventoryItem> {
    private readonly prisma;
    protected readonly entityType = "InventoryItem";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(): Promise<InventoryItem[]>;
    search(keyword?: string): unknown;
    similar(name?: string, spec?: string): unknown;
    private nextCode;
    create(data: {
        code?: string;
        name: string;
        unit: string;
        category?: string;
        purpose?: WarehousePurpose;
        spec?: string;
        brand?: string;
        referencePrice?: number;
        safetyStockThreshold?: number;
        shelfLifeDays?: number;
    }): unknown;
    update(id: string, data: Record<string, unknown>, expectedVersion: number): Promise<T>;
    deleteCheck(id: string): unknown;
    remove(id: string): Promise<{
        outcome: 'DELETED' | 'HIDDEN';
        message: string;
    }>;
    priceHistory(id: string): unknown;
}
