export declare class NewPurchaseItemDto {
    name: string;
    spec?: string;
    brand?: string;
    unit: string;
}
export declare class PurchaseOrderItemDto {
    itemId?: string;
    newItem?: NewPurchaseItemDto;
    quantity: number;
    unitPrice: number;
}
