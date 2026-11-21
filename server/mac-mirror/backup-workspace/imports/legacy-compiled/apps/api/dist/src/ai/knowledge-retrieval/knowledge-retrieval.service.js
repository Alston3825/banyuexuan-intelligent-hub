"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeRetrievalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const ai_gateway_client_1 = require("../ai-gateway/ai-gateway.client");
const chunk_text_util_1 = require("../common/chunk-text.util");
let KnowledgeRetrievalService = class KnowledgeRetrievalService {
    prisma;
    aiGatewayClient;
    ctx;
    constructor(prisma, aiGatewayClient, ctx) {
        this.prisma = prisma;
        this.aiGatewayClient = aiGatewayClient;
        this.ctx = ctx;
    }
    async search(query, topK = 3) {
        const chunks = await this.prisma.knowledgeChunk.findMany({
            where: { tenantId: this.ctx.tenantId, document: { status: 'ACTIVE' } },
            include: { document: { select: { id: true, title: true } } },
        });
        if (chunks.length === 0)
            return [];
        const { embeddings } = await this.aiGatewayClient.embed([query]);
        const queryEmbedding = embeddings[0];
        return chunks
            .map((chunk) => ({
            documentId: chunk.document.id,
            documentTitle: chunk.document.title,
            content: chunk.content,
            score: (0, chunk_text_util_1.cosineSimilarity)(queryEmbedding, chunk.embedding),
        }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }
};
exports.KnowledgeRetrievalService = KnowledgeRetrievalService;
exports.KnowledgeRetrievalService = KnowledgeRetrievalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_gateway_client_1.AiGatewayClient,
        request_context_service_1.RequestContextService])
], KnowledgeRetrievalService);
//# sourceMappingURL=knowledge-retrieval.service.js.map