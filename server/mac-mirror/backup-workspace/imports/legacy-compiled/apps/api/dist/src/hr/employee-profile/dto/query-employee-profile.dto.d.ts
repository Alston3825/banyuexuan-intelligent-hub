import { EmployeeProfileStatus } from '@prisma/client';
export declare class QueryEmployeeProfileDto {
    storeId?: string;
    status?: EmployeeProfileStatus;
    departmentId?: string;
    archived?: 'only' | 'all';
    keyword?: string;
}
