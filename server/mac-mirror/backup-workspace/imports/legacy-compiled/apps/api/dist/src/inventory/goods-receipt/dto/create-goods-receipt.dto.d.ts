import { GoodsReceiptItemDto } from './goods-receipt-item.dto';
export declare class CreateGoodsReceiptDto {
    storeId: string;
    warehouseId: string;
    purchaseOrderId?: string;
    remark?: string;
    items: GoodsReceiptItemDto[];
}
