import { LeaveType } from '@prisma/client';
export declare class CreateLeaveRequestDto {
    storeId: string;
    employeeProfileId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
}
