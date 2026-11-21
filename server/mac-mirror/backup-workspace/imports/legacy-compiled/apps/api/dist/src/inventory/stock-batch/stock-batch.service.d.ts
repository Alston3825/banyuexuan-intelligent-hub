import { PrismaService } from '../../prisma/prisma.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { QueryStockBatchDto } from './dto/query-stock-batch.dto';
export declare class StockBatchService {
    private readonly prisma;
    private readonly ctx;
    constructor(prisma: PrismaService, ctx: RequestContextService);
    findMany(query?: QueryStockBatchDto): unknown;
    expiryAlerts(query?: {
        warehouseId?: string;
        withinDays?: number;
    }): unknown;
}
