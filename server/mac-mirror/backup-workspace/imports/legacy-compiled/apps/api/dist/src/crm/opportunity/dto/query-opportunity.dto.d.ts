import { OpportunityStage } from '@prisma/client';
export declare class QueryOpportunityDto {
    stage?: OpportunityStage;
    customerId?: string;
    assignedToId?: string;
}
