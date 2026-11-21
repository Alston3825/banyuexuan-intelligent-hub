import { InventoryDocStatus } from '@prisma/client';
export declare class QueryGoodsReceiptDto {
    storeId?: string;
    warehouseId?: string;
    status?: InventoryDocStatus;
}
