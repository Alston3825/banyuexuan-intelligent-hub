import { Contract } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CustomerService } from '../../crm/customer/customer.service';
import { ContractStorageService } from '../contract-storage/contract-storage.service';
import { ContractExtractionService } from '../contract-extraction/contract-extraction.service';
import { QueryContractDto } from './dto/query-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ConfirmContractDto } from './dto/confirm-contract.dto';
export interface CustomerMatch {
    id: string;
    customerNo: string;
    name: string;
    phone: string;
    expectedDueDate: Date | null;
    reason: 'PHONE' | 'NAME';
}
export declare class ContractRecordService {
    private readonly prisma;
    private readonly customerService;
    private readonly storage;
    private readonly extraction;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, customerService: CustomerService, storage: ContractStorageService, extraction: ContractExtractionService, auditLogService: AuditLogService, ctx: RequestContextService);
    private readonly listInclude;
    findMany(query: QueryContractDto): unknown;
    findOneOrThrow(id: string): Promise<Contract>;
    getDetail(id: string): unknown;
    createFromUpload(files: Express.Multer.File[], storeId?: string): unknown;
    createManual(storeId?: string): unknown;
    private createBlank;
    private fileName;
    reextract(id: string): unknown;
    update(id: string, dto: UpdateContractDto): unknown;
    customerMatches(id: string): Promise<{
        matches: CustomerMatch[];
        suggestedId: string | null;
    }>;
    confirm(id: string, dto: ConfirmContractDto): unknown;
    private resolveCustomer;
    void(id: string, voidReason: string, expectedVersion: number): unknown;
    remove(id: string): Promise<void>;
    openFile(contractId: string, fileId: string): unknown;
    private assertVersion;
    private auditCtx;
}
