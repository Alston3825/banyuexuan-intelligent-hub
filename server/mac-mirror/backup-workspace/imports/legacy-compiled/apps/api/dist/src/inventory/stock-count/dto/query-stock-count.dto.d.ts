import { InventoryDocStatus } from '@prisma/client';
export declare class QueryStockCountDto {
    storeId?: string;
    warehouseId?: string;
    status?: InventoryDocStatus;
}
