import { CareDocType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { AiGatewayClient } from '../../ai/ai-gateway/ai-gateway.client';
import { CareDocumentExtractionService } from './care-document-extraction.service';
import { CareStorageService } from './care-storage.service';
export interface UploadMeta {
    docType: CareDocType;
    motherProfileId?: string;
    babyProfileId?: string;
    title?: string;
    docDate?: string;
    remark?: string;
    autoExtract?: string;
    scope?: string;
}
export declare class CareDocumentService {
    private readonly prisma;
    private readonly storage;
    private readonly extraction;
    private readonly aiGateway;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, storage: CareStorageService, extraction: CareDocumentExtractionService, aiGateway: AiGatewayClient, auditLogService: AuditLogService, ctx: RequestContextService);
    list(query: {
        motherProfileId?: string;
        babyProfileId?: string;
        docType?: CareDocType;
    }): any;
    getOne(id: string): unknown;
    upload(files: Express.Multer.File[], meta: UploadMeta): unknown;
    addFiles(id: string, files: Express.Multer.File[]): unknown;
    updateMeta(id: string, patch: {
        title?: string | null;
        docDate?: string | null;
        remark?: string | null;
    }): unknown;
    reextract(id: string): unknown;
    remove(id: string): Promise<void>;
    openFile(id: string, fileId: string): unknown;
    private fileName;
    private saveFiles;
    private resolveOwner;
}
