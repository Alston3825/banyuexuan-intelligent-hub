import { PayrollRecordStatus } from '@prisma/client';
export declare class QueryPayrollRecordDto {
    storeId?: string;
    employeeProfileId?: string;
    period?: string;
    status?: PayrollRecordStatus;
}
