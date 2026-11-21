import { MealPlanTemplateItemDto } from './meal-plan-template-item.dto';
export declare class UpdateMealPlanTemplateDto {
    name?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    items?: MealPlanTemplateItemDto[];
    version: number;
}
