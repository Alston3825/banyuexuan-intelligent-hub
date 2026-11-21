import { CommissionType } from '@prisma/client';
import { CommissionAllocationInputDto } from './commission-allocation-input.dto';
export declare class CreateCommissionRecordDto {
    storeId: string;
    type: CommissionType;
    sourceType: string;
    sourceId: string;
    totalAmount: number;
    remark?: string;
    allocations: CommissionAllocationInputDto[];
}
