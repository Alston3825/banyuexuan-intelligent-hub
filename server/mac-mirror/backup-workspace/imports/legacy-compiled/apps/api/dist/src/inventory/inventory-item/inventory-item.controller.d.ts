import { WarehousePurpose } from '@prisma/client';
import { InventoryItemService } from './inventory-item.service';
import { ImportItemRow, InventoryItemImportService } from './inventory-item-import.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
declare class CommitImportDto {
    items: ImportItemRow[];
    purpose: WarehousePurpose;
    category?: string;
    updateExisting: boolean;
}
export declare class InventoryItemController {
    private readonly inventoryItemService;
    private readonly importService;
    constructor(inventoryItemService: InventoryItemService, importService: InventoryItemImportService);
    importPreview(file?: Express.Multer.File): Promise<import("./inventory-item-import.service").ImportPreview>;
    importCommit(dto: CommitImportDto): unknown;
    search(keyword?: string): unknown;
    similar(name?: string, spec?: string): unknown;
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateInventoryItemDto): unknown;
    priceHistory(id: string): unknown;
    deleteCheck(id: string): unknown;
    remove(id: string): Promise<{
        outcome: "DELETED" | "HIDDEN";
        message: string;
    }>;
    update(id: string, dto: UpdateInventoryItemDto): Promise<T>;
}
export {};
