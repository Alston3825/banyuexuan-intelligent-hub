export declare class UpdateAccountDto {
    realName?: string;
    phone?: string;
    email?: string;
    storeId?: string | null;
    departmentId?: string | null;
    teamId?: string | null;
    positionId?: string | null;
    status?: 'ACTIVE' | 'DISABLED' | 'LOCKED';
    version: number;
}
