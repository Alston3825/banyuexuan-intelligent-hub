import { CareFieldDefinitionService } from './care-field-definition.service';
import { CreateCareFieldDefinitionDto } from './dto/create-care-field-definition.dto';
import { UpdateCareFieldDefinitionDto } from './dto/update-care-field-definition.dto';
import { QueryCareFieldDefinitionDto } from './dto/query-care-field-definition.dto';
export declare class CareFieldDefinitionController {
    private readonly careFieldDefinitionService;
    constructor(careFieldDefinitionService: CareFieldDefinitionService);
    findAll(query: QueryCareFieldDefinitionDto): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateCareFieldDefinitionDto): Promise<CareFieldDefinition>;
    update(id: string, dto: UpdateCareFieldDefinitionDto): Promise<T>;
}
