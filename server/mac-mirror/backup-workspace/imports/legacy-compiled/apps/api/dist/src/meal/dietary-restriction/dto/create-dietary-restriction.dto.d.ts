import { DietaryRestrictionCategory } from '@prisma/client';
export declare class CreateDietaryRestrictionDto {
    code: string;
    name: string;
    category: DietaryRestrictionCategory;
}
