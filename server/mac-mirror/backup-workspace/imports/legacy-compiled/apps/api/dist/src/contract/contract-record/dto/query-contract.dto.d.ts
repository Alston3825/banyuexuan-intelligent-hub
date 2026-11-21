import { ContractStatus } from '@prisma/client';
export declare class QueryContractDto {
    customerId?: string;
    storeId?: string;
    status?: ContractStatus;
    keyword?: string;
    unassigned?: boolean;
}
