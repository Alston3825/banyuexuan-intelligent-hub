import { InventoryDocStatus } from '@prisma/client';
export declare class QueryStockTransferDto {
    fromWarehouseId?: string;
    toWarehouseId?: string;
    status?: InventoryDocStatus;
}
