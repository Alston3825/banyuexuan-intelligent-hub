import { OfficeApprovalStatus } from '@prisma/client';
export declare class QueryLeaveRequestDto {
    storeId?: string;
    employeeProfileId?: string;
    status?: OfficeApprovalStatus;
}
