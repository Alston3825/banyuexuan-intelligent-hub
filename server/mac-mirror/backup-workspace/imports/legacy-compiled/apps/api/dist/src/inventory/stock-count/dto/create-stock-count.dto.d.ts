import { StockCountItemDto } from './stock-count-item.dto';
export declare class CreateStockCountDto {
    storeId: string;
    warehouseId: string;
    remark?: string;
    items: StockCountItemDto[];
}
