import { SatisfactionTemplate } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { RequestContextService } from '../common/context/request-context.service';
import { AiGatewayClient } from '../ai/ai-gateway/ai-gateway.client';
import { TemplateSpec } from './survey-specs';
export declare const toSpec: (t: SatisfactionTemplate) => TemplateSpec;
export declare function ensureDefaultTemplates(prisma: PrismaService, tenantId: string, accountId: string): Promise<void>;
export interface TemplateInput {
    name?: string;
    day?: number | null;
    goodWord?: string;
    badWord?: string;
    suggestionLabel?: string;
    praiseLabel?: string;
    groups?: unknown;
    status?: 'ACTIVE' | 'INACTIVE';
}
export declare class SatisfactionTemplateService {
    private readonly prisma;
    private readonly aiGateway;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, aiGateway: AiGatewayClient, auditLogService: AuditLogService, ctx: RequestContextService);
    list(): unknown;
    getOne(id: string): unknown;
    private build;
    create(input: TemplateInput, source?: 'MANUAL' | 'UPLOAD'): unknown;
    update(id: string, input: TemplateInput & {
        version?: number;
    }): unknown;
    duplicate(id: string): unknown;
    remove(id: string): any;
    importFile(file: Express.Multer.File): unknown;
    private xlsxText;
    private parseByVision;
    private parseByText;
    private audit;
}
