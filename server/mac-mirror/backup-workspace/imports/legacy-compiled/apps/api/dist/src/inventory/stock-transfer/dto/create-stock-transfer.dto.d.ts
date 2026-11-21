import { StockTransferItemDto } from './stock-transfer-item.dto';
export declare class CreateStockTransferDto {
    fromWarehouseId: string;
    toWarehouseId: string;
    remark?: string;
    items: StockTransferItemDto[];
}
