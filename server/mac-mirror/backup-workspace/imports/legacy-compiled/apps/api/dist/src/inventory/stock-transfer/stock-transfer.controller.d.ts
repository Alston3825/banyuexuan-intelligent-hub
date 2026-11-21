import { StockTransferService } from './stock-transfer.service';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { QueryStockTransferDto } from './dto/query-stock-transfer.dto';
import { CancelStockTransferDto } from './dto/cancel-stock-transfer.dto';
import { VersionDto } from './dto/version.dto';
export declare class StockTransferController {
    private readonly stockTransferService;
    constructor(stockTransferService: StockTransferService);
    findAll(query: QueryStockTransferDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateStockTransferDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    submit(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    execute(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    cancel(id: string, dto: CancelStockTransferDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
