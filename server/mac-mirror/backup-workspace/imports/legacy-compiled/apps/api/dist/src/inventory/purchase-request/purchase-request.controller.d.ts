import { PurchaseRequestStatus } from '@prisma/client';
import { PurchaseRequestKind } from '@prisma/client';
import { RequestLineBody } from './purchase-request.service';
import { PurchaseRequestService } from './purchase-request.service';
import { PurchaseRequestImportService, RequestImportRow } from './purchase-request-import.service';
declare class QueryDto {
    storeId?: string;
    status?: PurchaseRequestStatus;
    kind?: PurchaseRequestKind;
}
declare class VersionDto {
    version: number;
}
declare class CancelDto extends VersionDto {
    cancelReason: string;
}
declare class CommitImportDto {
    storeId: string;
    requestDate?: string;
    sourceFileName?: string;
    remark?: string;
    rows: RequestImportRow[];
    createMissingItems: boolean;
    allowDuplicate: boolean;
}
declare class LineDto extends VersionDto {
    name?: string;
    spec?: string | null;
    brand?: string | null;
    unit?: string | null;
    quantity?: number;
    unitPrice?: number | null;
    department?: string | null;
    requester?: string | null;
    purpose?: string | null;
    remark?: string | null;
    itemId?: string | null;
}
declare class ConvertDto extends VersionDto {
    supplierId: string;
    warehouseId: string;
    fixes?: {
        lineId: string;
        unitPrice?: number;
        itemId?: string;
    }[];
}
declare class CreateDepartmentDto {
    storeId?: string;
    requestDate?: string;
    remark?: string;
    items: RequestLineBody[];
    submit?: boolean;
}
declare class CreateManualDto {
    storeId: string;
    requestDate?: string;
    remark?: string;
    items: RequestLineBody[];
    createMissingItems?: boolean;
}
declare class CollectDto {
    ids: string[];
    remark?: string;
}
export declare class PurchaseRequestController {
    private readonly service;
    private readonly importService;
    constructor(service: PurchaseRequestService, importService: PurchaseRequestImportService);
    findAll(query: QueryDto): unknown;
    importPreview(file?: Express.Multer.File): Promise<import("./purchase-request-import.service").RequestImportPreview>;
    duplicate(storeId: string, requestDate: string): unknown;
    importCommit(dto: CommitImportDto): unknown;
    createDepartment(dto: CreateDepartmentDto): unknown;
    createManual(dto: CreateManualDto): unknown;
    collect(dto: CollectDto): unknown;
    findOne(id: string): unknown;
    addLine(id: string, dto: LineDto): unknown;
    updateLine(id: string, lineId: string, dto: LineDto): unknown;
    removeLine(id: string, lineId: string, version: string): unknown;
    submit(id: string, dto: VersionDto): unknown;
    recall(id: string, dto: VersionDto): unknown;
    cancel(id: string, dto: CancelDto): unknown;
    convert(id: string, dto: ConvertDto): unknown;
}
export {};
