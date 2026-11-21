import { BabyGender } from '@prisma/client';
export declare class CreateBabyProfileDto {
    motherProfileId: string;
    name?: string;
    gender?: BabyGender;
    birthDate?: string;
    birthWeightGrams?: number;
    apgarScore?: string;
    allergens?: string;
    remark?: string;
    riskTagIds?: string[];
}
