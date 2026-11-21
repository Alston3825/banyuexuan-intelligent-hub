import { GeneralMemoService } from './general-memo.service';
import { CreateGeneralMemoDto } from './dto/create-general-memo.dto';
import { QueryGeneralMemoDto } from './dto/query-general-memo.dto';
import { CancelGeneralMemoDto } from './dto/cancel-general-memo.dto';
import { VersionDto } from './dto/version.dto';
export declare class GeneralMemoController {
    private readonly generalMemoService;
    constructor(generalMemoService: GeneralMemoService);
    findAll(query: QueryGeneralMemoDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateGeneralMemoDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    submit(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    cancel(id: string, dto: CancelGeneralMemoDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
