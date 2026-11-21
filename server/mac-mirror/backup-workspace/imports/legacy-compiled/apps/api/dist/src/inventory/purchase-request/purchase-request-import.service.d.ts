import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
import { InventoryItemImportService } from '../inventory-item/inventory-item-import.service';
export interface RequestImportRow {
    rowNo: number;
    department: string | null;
    requester: string | null;
    name: string;
    spec: string | null;
    brand: string | null;
    unit: string | null;
    quantity: number | null;
    unitPrice: number | null;
    purpose: string | null;
}
export interface RequestImportPreviewRow extends RequestImportRow {
    sheetSubtotal: number | null;
    itemId: string | null;
    issues: string[];
}
export interface RequestImportPreview {
    sheetName: string;
    headerRow: number;
    titleText: string | null;
    storeGuess: {
        id: string;
        name: string;
    } | null;
    requestDate: string | null;
    sheetTotal: number | null;
    rows: RequestImportPreviewRow[];
    duplicate: {
        id: string;
        requestNo: string;
        totalAmount: string;
    } | null;
}
export declare class PurchaseRequestImportService {
    private readonly prisma;
    private readonly itemImport;
    private readonly auditLogService;
    private readonly dataScope;
    private readonly ctx;
    constructor(prisma: PrismaService, itemImport: InventoryItemImportService, auditLogService: AuditLogService, dataScope: DataScopeService, ctx: RequestContextService);
    private itemKeyMap;
    private rowIssues;
    private findDuplicate;
    preview(file: Buffer): Promise<RequestImportPreview>;
    checkDuplicate(storeId: string, requestDate: string): unknown;
    commit(input: {
        storeId: string;
        requestDate?: string;
        sourceFileName?: string;
        remark?: string;
        rows: RequestImportRow[];
        createMissingItems: boolean;
        allowDuplicate: boolean;
    }): unknown;
}
