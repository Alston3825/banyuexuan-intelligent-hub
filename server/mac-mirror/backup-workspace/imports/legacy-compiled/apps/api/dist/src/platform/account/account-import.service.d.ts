import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
import { CellValue } from '../../common/utils/xlsx-reader';
import { AccountService } from './account.service';
export declare const DEFAULT_PASSWORD = "banyuexuan";
export interface ImportRow {
    rowNo: number;
    employeeNo: string | null;
    name: string;
    phone: string | null;
    storeName: string | null;
    teamName: string | null;
    departmentName: string | null;
    positionName: string | null;
    hireDate: string | null;
    contractType: string | null;
    socialInsurance: string | null;
    idCardNo: string | null;
    bankAccountNo: string | null;
    bankName: string | null;
    remark: string | null;
}
export interface ImportIssue {
    level: 'error' | 'warn';
    text: string;
}
export interface ImportPreviewRow extends ImportRow {
    storeId: string | null;
    employeeNoSuggested: boolean;
    newDepartment: boolean;
    newPosition: boolean;
    resigned: boolean;
    existingAccountId: string | null;
    existingNo: string | null;
    willRenumber: boolean;
    issues: ImportIssue[];
}
export interface ImportPreview {
    sheetName: string;
    headerRow: number;
    ignoredColumns: string[];
    rows: ImportPreviewRow[];
}
export declare function parseSheetDate(v: CellValue): string | null;
export declare class AccountImportService {
    private readonly prisma;
    private readonly accountService;
    private readonly auditLogService;
    private readonly dataScope;
    private readonly ctx;
    constructor(prisma: PrismaService, accountService: AccountService, auditLogService: AuditLogService, dataScope: DataScopeService, ctx: RequestContextService);
    private get tenantId();
    preview(file: Buffer): Promise<ImportPreview>;
    check(rows: ImportRow[], defaultStoreId?: string): Promise<ImportPreviewRow[]>;
    commit(input: {
        rows: ImportRow[];
        storeId: string;
        createMissing: boolean;
        roleId?: string;
        importProfileDetails: boolean;
    }): unknown;
    private writeProfileDetails;
}
