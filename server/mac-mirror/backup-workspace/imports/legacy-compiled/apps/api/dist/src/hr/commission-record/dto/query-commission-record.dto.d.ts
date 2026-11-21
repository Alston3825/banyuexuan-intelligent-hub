import { CommissionRecordStatus, CommissionType } from '@prisma/client';
export declare class QueryCommissionRecordDto {
    storeId?: string;
    type?: CommissionType;
    status?: CommissionRecordStatus;
}
