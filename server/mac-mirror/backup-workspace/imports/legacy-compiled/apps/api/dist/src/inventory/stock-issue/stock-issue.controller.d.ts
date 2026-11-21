import { StockIssueService } from './stock-issue.service';
import { CreateStockIssueDto } from './dto/create-stock-issue.dto';
import { QueryStockIssueDto } from './dto/query-stock-issue.dto';
import { CancelStockIssueDto } from './dto/cancel-stock-issue.dto';
import { VersionDto } from './dto/version.dto';
export declare class StockIssueController {
    private readonly stockIssueService;
    constructor(stockIssueService: StockIssueService);
    findAll(query: QueryStockIssueDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateStockIssueDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    submit(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    execute(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    cancel(id: string, dto: CancelStockIssueDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
