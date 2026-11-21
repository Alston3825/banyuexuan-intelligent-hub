import { FollowUpType } from '@prisma/client';
export declare class FollowUpCareAbnormalityDto {
    type: FollowUpType;
    content: string;
    nextFollowUpAt?: string;
}
