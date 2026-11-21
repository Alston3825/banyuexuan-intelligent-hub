import { OpportunityService } from './opportunity.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { AdvanceStageDto } from './dto/advance-stage.dto';
import { LoseOpportunityDto } from './dto/lose-opportunity.dto';
import { QueryOpportunityDto } from './dto/query-opportunity.dto';
export declare class OpportunityController {
    private readonly opportunityService;
    constructor(opportunityService: OpportunityService);
    findAll(query: QueryOpportunityDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateOpportunityDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    update(id: string, dto: UpdateOpportunityDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    advanceStage(id: string, dto: AdvanceStageDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    lose(id: string, dto: LoseOpportunityDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
