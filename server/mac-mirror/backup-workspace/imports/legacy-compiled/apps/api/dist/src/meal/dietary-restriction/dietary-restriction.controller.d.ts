import { DietaryRestrictionService } from './dietary-restriction.service';
import { CreateDietaryRestrictionDto } from './dto/create-dietary-restriction.dto';
import { UpdateDietaryRestrictionDto } from './dto/update-dietary-restriction.dto';
export declare class DietaryRestrictionController {
    private readonly dietaryRestrictionService;
    constructor(dietaryRestrictionService: DietaryRestrictionService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateDietaryRestrictionDto): Promise<T>;
    update(id: string, dto: UpdateDietaryRestrictionDto): Promise<T>;
}
