export declare class UpdateInventoryItemDto {
    name?: string;
    category?: string;
    unit?: string;
    spec?: string;
    brand?: string;
    referencePrice?: number | null;
    safetyStockThreshold?: number;
    shelfLifeDays?: number;
    status?: 'ACTIVE' | 'INACTIVE';
    version: number;
}
