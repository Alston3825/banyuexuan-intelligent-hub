import { StockCountService } from './stock-count.service';
import { CreateStockCountDto } from './dto/create-stock-count.dto';
import { QueryStockCountDto } from './dto/query-stock-count.dto';
import { CancelStockCountDto } from './dto/cancel-stock-count.dto';
import { VersionDto } from './dto/version.dto';
export declare class StockCountController {
    private readonly stockCountService;
    constructor(stockCountService: StockCountService);
    findAll(query: QueryStockCountDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateStockCountDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    submit(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    execute(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    cancel(id: string, dto: CancelStockCountDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
