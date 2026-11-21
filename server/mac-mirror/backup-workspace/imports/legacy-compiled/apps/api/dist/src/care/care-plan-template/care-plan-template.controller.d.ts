import { CarePlanTemplateService } from './care-plan-template.service';
import { CreateCarePlanTemplateDto } from './dto/create-care-plan-template.dto';
import { UpdateCarePlanTemplateDto } from './dto/update-care-plan-template.dto';
import { QueryCarePlanTemplateDto } from './dto/query-care-plan-template.dto';
export declare class CarePlanTemplateController {
    private readonly carePlanTemplateService;
    constructor(carePlanTemplateService: CarePlanTemplateService);
    findAll(query: QueryCarePlanTemplateDto): Promise<{}>;
    findOne(id: string): unknown;
    create(dto: CreateCarePlanTemplateDto): unknown;
    update(id: string, dto: UpdateCarePlanTemplateDto): unknown;
}
