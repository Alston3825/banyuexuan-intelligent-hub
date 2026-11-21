import { BabyGender } from '@prisma/client';
export declare class BabyProfileInputDto {
    name?: string;
    gender?: BabyGender;
    birthDate?: string;
    birthWeightGrams?: number;
    apgarScore?: string;
    allergens?: string;
    remark?: string;
    riskTagIds?: string[];
}
