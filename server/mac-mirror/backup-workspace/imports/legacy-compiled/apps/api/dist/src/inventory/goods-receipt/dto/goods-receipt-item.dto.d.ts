export declare class NewReceiptItemDto {
    name: string;
    spec?: string;
    brand?: string;
    unit: string;
}
export declare class GoodsReceiptItemDto {
    itemId?: string;
    newItem?: NewReceiptItemDto;
    renameItemTo?: string;
    quantity: number;
    unitCost: number;
}
