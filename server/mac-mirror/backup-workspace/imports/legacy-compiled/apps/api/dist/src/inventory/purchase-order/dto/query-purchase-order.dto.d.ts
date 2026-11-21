import { InventoryDocStatus } from '@prisma/client';
export declare class QueryPurchaseOrderDto {
    storeId?: string;
    warehouseId?: string;
    supplierId?: string;
    status?: InventoryDocStatus;
}
