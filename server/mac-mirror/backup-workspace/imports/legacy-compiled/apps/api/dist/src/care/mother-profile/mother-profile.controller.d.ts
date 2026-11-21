import { MotherProfileService } from './mother-profile.service';
import { CreateMotherProfileDto } from './dto/create-mother-profile.dto';
import { UpdateMotherProfileDto } from './dto/update-mother-profile.dto';
import { QueryMotherProfileDto } from './dto/query-mother-profile.dto';
declare class SetRiskTagsDto {
    tagIds: string[];
}
export declare class MotherProfileController {
    private readonly motherProfileService;
    constructor(motherProfileService: MotherProfileService);
    findAll(query: QueryMotherProfileDto): any;
    formOptions(): unknown;
    nurseOptions(storeId?: string): unknown;
    findOne(id: string): unknown;
    riskTags(id: string): unknown;
    setRiskTags(id: string, dto: SetRiskTagsDto): unknown;
    create(dto: CreateMotherProfileDto): Promise<MotherProfile>;
    update(id: string, dto: UpdateMotherProfileDto): Promise<MotherProfile>;
    deleteCheck(id: string): unknown;
    remove(id: string, force?: string, confirmName?: string): Promise<void>;
    archive(id: string): Promise<void>;
    restore(id: string): Promise<void>;
}
export {};
