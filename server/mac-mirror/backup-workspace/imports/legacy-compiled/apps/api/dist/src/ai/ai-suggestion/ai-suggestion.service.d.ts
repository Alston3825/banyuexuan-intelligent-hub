import { AiSuggestion, AiSuggestionScenario } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { QueryAiSuggestionDto } from './dto/query-ai-suggestion.dto';
export interface RecordSuggestionInput {
    storeId: string;
    scenario: AiSuggestionScenario;
    businessType: string;
    businessId: string;
    inputText: string;
    outputText: string;
    modelProvider: string;
    modelName: string;
    usedFallback: boolean;
    latencyMs: number;
    escalate?: boolean;
}
export declare class AiSuggestionService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryAiSuggestionDto): Promise<AiSuggestion[]>;
    findOneOrThrow(id: string): Promise<AiSuggestion>;
    record(input: RecordSuggestionInput): Promise<AiSuggestion>;
    accept(id: string, expectedVersion: number): Promise<AiSuggestion>;
    dismiss(id: string, expectedVersion: number): Promise<AiSuggestion>;
    private transition;
    private auditCtx;
}
