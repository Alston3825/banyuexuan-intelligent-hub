import { DeliveryMethod } from '@prisma/client';
import { BabyProfileInputDto } from './baby-profile-input.dto';
export declare class CreateMotherProfileDto {
    customerId: string;
    occupancyId?: string;
    deliveryMethod?: DeliveryMethod;
    deliveryDate?: string;
    gestationalWeeks?: number;
    expectedDeliveryDate?: string;
    careNote?: string;
    primaryNurseId?: string;
    allergens?: string;
    remark?: string;
    riskTagIds?: string[];
    babies?: BabyProfileInputDto[];
}
