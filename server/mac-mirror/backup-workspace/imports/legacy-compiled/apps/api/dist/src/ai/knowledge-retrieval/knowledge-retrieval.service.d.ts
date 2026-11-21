import { PrismaService } from '../../prisma/prisma.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { AiGatewayClient } from '../ai-gateway/ai-gateway.client';
export interface RetrievedChunk {
    documentId: string;
    documentTitle: string;
    content: string;
    score: number;
}
export declare class KnowledgeRetrievalService {
    private readonly prisma;
    private readonly aiGatewayClient;
    private readonly ctx;
    constructor(prisma: PrismaService, aiGatewayClient: AiGatewayClient, ctx: RequestContextService);
    search(query: string, topK?: number): Promise<RetrievedChunk[]>;
}
