import { MealPlanType } from '@prisma/client';
import { MealPlanTemplateItemDto } from './meal-plan-template-item.dto';
export declare class CreateMealPlanTemplateDto {
    code: string;
    name: string;
    planType: MealPlanType;
    totalDays: number;
    phases?: {
        name: string;
        days: number;
    }[];
    items: MealPlanTemplateItemDto[];
}
