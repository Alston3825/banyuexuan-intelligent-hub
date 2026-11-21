import { DeliveryMethod } from '@prisma/client';
export declare class UpdateMotherProfileDto {
    occupancyId?: string;
    deliveryMethod?: DeliveryMethod;
    deliveryDate?: string;
    gestationalWeeks?: number;
    expectedDeliveryDate?: string;
    careNote?: string;
    primaryNurseId?: string | null;
    allergens?: string;
    remark?: string;
    version: number;
}
