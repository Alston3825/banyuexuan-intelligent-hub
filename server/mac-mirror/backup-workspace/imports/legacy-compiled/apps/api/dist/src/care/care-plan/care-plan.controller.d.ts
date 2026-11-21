import { CarePlanService } from './care-plan.service';
import { CreateCarePlanDto } from './dto/create-care-plan.dto';
import { QueryCarePlanDto } from './dto/query-care-plan.dto';
import { TerminateCarePlanDto } from './dto/terminate-care-plan.dto';
export declare class CarePlanController {
    private readonly carePlanService;
    constructor(carePlanService: CarePlanService);
    findAll(query: QueryCarePlanDto): any;
    findOne(id: string): unknown;
    create(dto: CreateCarePlanDto): Promise<CarePlan>;
    terminate(id: string, dto: TerminateCarePlanDto): Promise<CarePlan>;
}
