export declare class CreateAccountDto {
    username: string;
    realName: string;
    password: string;
    phone?: string;
    email?: string;
    storeId?: string;
    departmentId?: string;
    teamId?: string;
    positionId?: string;
    status?: 'ACTIVE' | 'DISABLED';
    employeeNo?: string;
    hireDate?: string;
}
