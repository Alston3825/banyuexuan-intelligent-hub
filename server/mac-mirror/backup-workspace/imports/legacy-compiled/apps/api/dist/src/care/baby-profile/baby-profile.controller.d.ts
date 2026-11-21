import { BabyProfileService } from './baby-profile.service';
import { CreateBabyProfileDto } from './dto/create-baby-profile.dto';
import { UpdateBabyProfileDto } from './dto/update-baby-profile.dto';
import { QueryBabyProfileDto } from './dto/query-baby-profile.dto';
declare class SetBabyRiskTagsDto {
    tagIds: string[];
}
export declare class BabyProfileController {
    private readonly babyProfileService;
    constructor(babyProfileService: BabyProfileService);
    findAll(query: QueryBabyProfileDto): Promise<{}>;
    findOne(id: string): Promise<BabyProfile>;
    riskTags(id: string): any;
    setRiskTags(id: string, dto: SetBabyRiskTagsDto): unknown;
    create(dto: CreateBabyProfileDto): Promise<BabyProfile>;
    update(id: string, dto: UpdateBabyProfileDto): Promise<BabyProfile>;
    deleteCheck(id: string): unknown;
    remove(id: string, force?: string, confirmName?: string): Promise<void>;
}
export {};
