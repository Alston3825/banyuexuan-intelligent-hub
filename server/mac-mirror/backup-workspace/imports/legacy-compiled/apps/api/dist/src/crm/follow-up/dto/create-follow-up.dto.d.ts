import { FollowUpType } from '@prisma/client';
declare const BUSINESS_TYPES: readonly ["LEAD", "OPPORTUNITY", "CUSTOMER"];
export declare class CreateFollowUpDto {
    businessType: (typeof BUSINESS_TYPES)[number];
    businessId: string;
    type: FollowUpType;
    content: string;
    nextFollowUpAt?: string;
}
export {};
