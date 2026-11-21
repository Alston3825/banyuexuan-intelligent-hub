import { InventoryDocStatus, StockIssueType } from '@prisma/client';
export declare class QueryStockIssueDto {
    storeId?: string;
    warehouseId?: string;
    issueType?: StockIssueType;
    status?: InventoryDocStatus;
}
