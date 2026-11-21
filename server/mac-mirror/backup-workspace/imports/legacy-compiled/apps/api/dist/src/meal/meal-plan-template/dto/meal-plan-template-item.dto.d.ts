import { MealSlot } from '@prisma/client';
export declare class MealPlanTemplateItemDto {
    dayOffset: number;
    slot: MealSlot;
    mealItemId: string;
}
