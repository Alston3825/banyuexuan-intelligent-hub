import { WarehousePurpose } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
export interface ImportItemRow {
    rowNo: number;
    name: string;
    spec: string | null;
    brand: string | null;
    unit: string | null;
    referencePrice: number | null;
}
export type ImportRowStatus = 'NEW' | 'EXISTS' | 'DUP_IN_FILE' | 'MISSING_UNIT';
export interface ImportPreviewRow extends ImportItemRow {
    status: ImportRowStatus;
    message: string;
    existingId: string | null;
}
export interface ImportPreview {
    sheetName: string;
    headerRow: number;
    ignoredColumns: string[];
    rows: ImportPreviewRow[];
}
export declare const norm: (s: string | null | undefined) => any;
export declare const keyOf: (name: string, spec: string | null) => string;
export declare class InventoryItemImportService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    preview(file: Buffer): Promise<ImportPreview>;
    classify(rows: ImportItemRow[]): Promise<ImportPreviewRow[]>;
    private nextCodes;
    ensureItems(rows: ImportItemRow[], opts: {
        createMissing: boolean;
        purpose: WarehousePurpose;
        category?: string;
    }): Promise<Map<string, string>>;
    commit(input: {
        items: ImportItemRow[];
        purpose: WarehousePurpose;
        category?: string;
        updateExisting: boolean;
    }): unknown;
}
export declare function nextFreeCodes(rows: {
    code: string;
}[], count: number): string[];
