import { WarehouseStockService } from './warehouse-stock.service';
import { QueryWarehouseStockDto } from './dto/query-warehouse-stock.dto';
export declare class WarehouseStockController {
    private readonly warehouseStockService;
    constructor(warehouseStockService: WarehouseStockService);
    findAll(query: QueryWarehouseStockDto): import(".prisma/client").Prisma.PrismaPromise<{}>;
    overview(warehouseId?: string, keyword?: string, status?: string): unknown;
    lowStockAlerts(warehouseId?: string): unknown;
}
