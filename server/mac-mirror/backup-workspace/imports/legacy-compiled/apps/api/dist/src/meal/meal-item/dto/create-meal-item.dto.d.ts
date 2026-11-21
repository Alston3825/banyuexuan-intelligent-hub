import { MealSlot } from '@prisma/client';
export declare class CreateMealItemDto {
    code: string;
    name: string;
    defaultSlot: MealSlot;
    ingredientTags?: string[];
}
