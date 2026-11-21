import { FollowUpService } from './follow-up.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { QueryFollowUpDto } from './dto/query-follow-up.dto';
export declare class FollowUpController {
    private readonly followUpService;
    constructor(followUpService: FollowUpService);
    findAll(query: QueryFollowUpDto): Promise<{}>;
    create(dto: CreateFollowUpDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
