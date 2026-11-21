import { MealPlanTemplateService } from './meal-plan-template.service';
import { CreateMealPlanTemplateDto } from './dto/create-meal-plan-template.dto';
import { UpdateMealPlanTemplateDto } from './dto/update-meal-plan-template.dto';
export declare class MealPlanTemplateController {
    private readonly mealPlanTemplateService;
    constructor(mealPlanTemplateService: MealPlanTemplateService);
    findAll(): any;
    findOne(id: string): unknown;
    create(dto: CreateMealPlanTemplateDto): Promise<MealPlanTemplate>;
    update(id: string, dto: UpdateMealPlanTemplateDto): Promise<MealPlanTemplate>;
}
