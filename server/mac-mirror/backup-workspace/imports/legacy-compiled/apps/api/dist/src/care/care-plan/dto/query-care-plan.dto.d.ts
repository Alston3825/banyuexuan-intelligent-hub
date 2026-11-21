import { CarePlanStatus } from '@prisma/client';
export declare class QueryCarePlanDto {
    motherProfileId?: string;
    babyProfileId?: string;
    status?: CarePlanStatus;
}
