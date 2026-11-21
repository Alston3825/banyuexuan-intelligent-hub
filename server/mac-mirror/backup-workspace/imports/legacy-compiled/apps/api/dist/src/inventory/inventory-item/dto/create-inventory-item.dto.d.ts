import { WarehousePurpose } from '@prisma/client';
export declare class CreateInventoryItemDto {
    code?: string;
    name: string;
    unit: string;
    category?: string;
    spec?: string;
    brand?: string;
    referencePrice?: number;
    purpose?: WarehousePurpose;
    safetyStockThreshold?: number;
    shelfLifeDays?: number;
}
