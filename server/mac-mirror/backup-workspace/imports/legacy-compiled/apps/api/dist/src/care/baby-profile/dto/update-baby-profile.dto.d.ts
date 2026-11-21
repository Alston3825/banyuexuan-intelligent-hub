import { BabyGender } from '@prisma/client';
export declare class UpdateBabyProfileDto {
    name?: string;
    gender?: BabyGender;
    birthDate?: string;
    birthWeightGrams?: number;
    apgarScore?: string;
    allergens?: string;
    remark?: string;
    version: number;
}
