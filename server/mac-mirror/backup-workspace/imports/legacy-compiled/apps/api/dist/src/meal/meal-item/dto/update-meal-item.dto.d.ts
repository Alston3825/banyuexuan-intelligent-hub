import { MealSlot } from '@prisma/client';
export declare class UpdateMealItemDto {
    name?: string;
    defaultSlot?: MealSlot;
    ingredientTags?: string[];
    status?: 'ACTIVE' | 'INACTIVE';
    version: number;
}
