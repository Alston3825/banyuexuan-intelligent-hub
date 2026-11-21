declare const BUSINESS_TYPES: readonly ["LEAD", "OPPORTUNITY", "CUSTOMER"];
export declare class QueryFollowUpDto {
    businessType: (typeof BUSINESS_TYPES)[number];
    businessId: string;
}
export {};
