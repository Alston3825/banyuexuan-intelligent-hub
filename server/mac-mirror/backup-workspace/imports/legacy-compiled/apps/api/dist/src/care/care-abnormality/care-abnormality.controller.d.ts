import { CareAbnormalityService } from './care-abnormality.service';
import { QueryCareAbnormalityDto } from './dto/query-care-abnormality.dto';
import { FollowUpCareAbnormalityDto } from './dto/follow-up-care-abnormality.dto';
import { ResolveCareAbnormalityDto } from './dto/resolve-care-abnormality.dto';
export declare class CareAbnormalityController {
    private readonly careAbnormalityService;
    constructor(careAbnormalityService: CareAbnormalityService);
    findAll(query: QueryCareAbnormalityDto): any;
    findOne(id: string): Promise<CareAbnormality>;
    followUps(id: string): Promise<{}>;
    follow(id: string, dto: FollowUpCareAbnormalityDto): unknown;
    resolve(id: string, dto: ResolveCareAbnormalityDto): Promise<CareAbnormality>;
    ignore(id: string, dto: ResolveCareAbnormalityDto): Promise<CareAbnormality>;
}
