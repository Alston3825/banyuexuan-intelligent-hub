import { CareFormTemplateService } from './care-form-template.service';
import { CreateCareFormTemplateDto } from './dto/create-care-form-template.dto';
import { UpdateCareFormTemplateDto } from './dto/update-care-form-template.dto';
import { QueryCareFormTemplateDto } from './dto/query-care-form-template.dto';
export declare class CareFormTemplateController {
    private readonly careFormTemplateService;
    constructor(careFormTemplateService: CareFormTemplateService);
    findAll(query: QueryCareFormTemplateDto): Promise<{}>;
    findOne(id: string): unknown;
    create(dto: CreateCareFormTemplateDto): unknown;
    update(id: string, dto: UpdateCareFormTemplateDto): unknown;
}
