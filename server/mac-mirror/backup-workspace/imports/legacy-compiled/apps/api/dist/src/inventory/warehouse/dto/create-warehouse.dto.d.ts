import { WarehousePurpose } from '@prisma/client';
export declare class CreateWarehouseDto {
    storeId: string;
    code: string;
    name: string;
    purpose?: WarehousePurpose;
    requiresApproval?: boolean;
}
