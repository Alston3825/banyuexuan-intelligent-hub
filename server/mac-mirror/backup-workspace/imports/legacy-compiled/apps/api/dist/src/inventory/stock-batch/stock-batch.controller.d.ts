import { StockBatchService } from './stock-batch.service';
import { QueryStockBatchDto } from './dto/query-stock-batch.dto';
export declare class StockBatchController {
    private readonly stockBatchService;
    constructor(stockBatchService: StockBatchService);
    findAll(query: QueryStockBatchDto): unknown;
    expiryAlerts(warehouseId?: string, withinDays?: string): unknown;
}
