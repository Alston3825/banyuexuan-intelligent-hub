import { OfficeApprovalStatus } from '@prisma/client';
export declare class QueryExpenseClaimDto {
    storeId?: string;
    applicantId?: string;
    status?: OfficeApprovalStatus;
}
