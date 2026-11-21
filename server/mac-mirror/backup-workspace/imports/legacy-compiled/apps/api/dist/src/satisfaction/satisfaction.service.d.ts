import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { RequestContextService } from '../common/context/request-context.service';
import { AiGatewayClient } from '../ai/ai-gateway/ai-gateway.client';
import { CareStorageService } from '../care/care-document/care-storage.service';
import { SatisfactionExtractionService } from './satisfaction-extraction.service';
export interface SurveyFilter {
    templateId?: string;
    from?: string;
    to?: string;
    storeId?: string;
    steward?: string;
}
export interface SurveyPatch {
    customerId?: string | null;
    customerName?: string | null;
    roomNo?: string | null;
    stewardName?: string | null;
    nurseName?: string | null;
    phone?: string | null;
    surveyDate?: string | null;
    scores?: Record<string, number | null>;
    suggestion?: string | null;
    praise?: string | null;
}
export declare class SatisfactionService {
    private readonly prisma;
    private readonly storage;
    private readonly extraction;
    private readonly aiGateway;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, storage: CareStorageService, extraction: SatisfactionExtractionService, aiGateway: AiGatewayClient, auditLogService: AuditLogService, ctx: RequestContextService);
    specs(): unknown;
    private templateOf;
    private where;
    list(q: SurveyFilter & {
        status?: string;
        keyword?: string;
    }): unknown;
    getOne(id: string): unknown;
    create(files: Express.Multer.File[], dto: {
        templateId: string;
        customerId?: string;
    }): unknown;
    addFiles(id: string, files: Express.Multer.File[]): unknown;
    update(id: string, patch: SurveyPatch): unknown;
    confirm(id: string): unknown;
    unconfirm(id: string): unknown;
    reextract(id: string): unknown;
    remove(id: string): any;
    openFile(id: string, fileId: string): unknown;
    stats(f: SurveyFilter): unknown;
    comments(f: SurveyFilter & {
        keyword?: string;
    }): unknown;
    summarize(f: SurveyFilter): unknown;
    private fileName;
    private audit;
    private saveFiles;
}
