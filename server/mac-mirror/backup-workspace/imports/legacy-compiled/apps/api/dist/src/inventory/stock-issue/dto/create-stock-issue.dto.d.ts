import { StockIssueType } from '@prisma/client';
import { StockIssueItemDto } from './stock-issue-item.dto';
export declare class CreateStockIssueDto {
    storeId: string;
    warehouseId: string;
    issueType?: StockIssueType;
    remark?: string;
    items: StockIssueItemDto[];
}
