import { CareAbnormalityStatus } from '@prisma/client';
export declare class QueryCareAbnormalityDto {
    motherProfileId?: string;
    babyProfileId?: string;
    status?: CareAbnormalityStatus;
}
