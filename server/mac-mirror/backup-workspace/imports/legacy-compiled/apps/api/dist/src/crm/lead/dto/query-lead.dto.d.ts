import { LeadStatus } from '@prisma/client';
export declare class QueryLeadDto {
    status?: LeadStatus;
    assignedToId?: string;
    storeId?: string;
}
