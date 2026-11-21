import { PurchaseOrderItemDto } from './purchase-order-item.dto';
export declare class CreatePurchaseOrderDto {
    storeId: string;
    warehouseId: string;
    supplierId: string;
    remark?: string;
    items: PurchaseOrderItemDto[];
}
