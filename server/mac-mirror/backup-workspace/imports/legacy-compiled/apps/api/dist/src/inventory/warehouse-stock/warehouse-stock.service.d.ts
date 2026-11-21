import { PrismaService } from '../../prisma/prisma.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { QueryWarehouseStockDto } from './dto/query-warehouse-stock.dto';
export declare class WarehouseStockService {
    private readonly prisma;
    private readonly ctx;
    constructor(prisma: PrismaService, ctx: RequestContextService);
    findMany(query?: QueryWarehouseStockDto): import(".prisma/client").Prisma.PrismaPromise<{}>;
    lowStockAlerts(query?: {
        warehouseId?: string;
    }): unknown;
    overview(query?: {
        warehouseId?: string;
        keyword?: string;
        status?: 'ALL' | 'ALERT' | 'LOW' | 'OUT' | 'IN_STOCK';
    }): unknown;
}
