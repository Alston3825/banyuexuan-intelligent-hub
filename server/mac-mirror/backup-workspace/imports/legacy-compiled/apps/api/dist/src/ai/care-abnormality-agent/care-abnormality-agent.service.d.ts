import { AiSuggestion } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CareAbnormalityService } from '../../care/care-abnormality/care-abnormality.service';
import { AiGatewayClient } from '../ai-gateway/ai-gateway.client';
import { AiSuggestionService } from '../ai-suggestion/ai-suggestion.service';
import { KnowledgeRetrievalService } from '../knowledge-retrieval/knowledge-retrieval.service';
export declare class CareAbnormalityAgentService {
    private readonly prisma;
    private readonly careAbnormalityService;
    private readonly aiGatewayClient;
    private readonly aiSuggestionService;
    private readonly knowledgeRetrievalService;
    constructor(prisma: PrismaService, careAbnormalityService: CareAbnormalityService, aiGatewayClient: AiGatewayClient, aiSuggestionService: AiSuggestionService, knowledgeRetrievalService: KnowledgeRetrievalService);
    suggest(abnormalityId: string): Promise<{
        suggestion: AiSuggestion;
        answer: string;
    }>;
    private buildContext;
}
