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
exports.KnowledgeDocumentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const ai_gateway_client_1 = require("../ai-gateway/ai-gateway.client");
const chunk_text_util_1 = require("../common/chunk-text.util");
let KnowledgeDocumentService = class KnowledgeDocumentService {
    prisma;
    aiGatewayClient;
    auditLogService;
    ctx;
    constructor(prisma, aiGatewayClient, auditLogService, ctx) {
        this.prisma = prisma;
        this.aiGatewayClient = aiGatewayClient;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany() {
        return this.prisma.knowledgeDocument.findMany({ where: { tenantId: this.ctx.tenantId }, orderBy: { createdAt: 'desc' } });
    }
    async findOneOrThrow(id) {
        const doc = await this.prisma.knowledgeDocument.findUnique({ where: { id } });
        if (!doc)
            throw new common_1.NotFoundException(`KnowledgeDocument ${id} 不存在`);
        return doc;
    }
    async create(dto) {
        const document = await this.prisma.knowledgeDocument.create({
            data: {
                tenantId: this.ctx.tenantId,
                title: dto.title,
                content: dto.content,
                category: dto.category,
                createdBy: this.ctx.accountId,
            },
        });
        await this.rebuildChunks(document.id, dto.content);
        await this.auditLogService.record({ action: 'CREATE', entityType: 'KnowledgeDocument', entityId: document.id, afterData: document, ...this.auditCtx() });
        return document;
    }
    async update(id, dto) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== dto.version)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.knowledgeDocument.update({
            where: { id, version: dto.version },
            data: {
                title: dto.title,
                content: dto.content,
                category: dto.category,
                status: dto.status,
                version: { increment: 1 },
            },
        }));
        if (dto.content !== undefined && dto.content !== before.content) {
            await this.rebuildChunks(id, dto.content);
        }
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'KnowledgeDocument',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: Object.keys(dto).filter((k) => k !== 'version'),
            ...this.auditCtx(),
        });
        return updated;
    }
    async delete(id) {
        const before = await this.findOneOrThrow(id);
        await this.prisma.knowledgeDocument.delete({ where: { id } });
        await this.auditLogService.record({ action: 'DELETE', entityType: 'KnowledgeDocument', entityId: id, beforeData: before, ...this.auditCtx() });
    }
    async rebuildChunks(documentId, content) {
        const pieces = (0, chunk_text_util_1.chunkText)(content);
        await this.prisma.knowledgeChunk.deleteMany({ where: { documentId } });
        if (pieces.length === 0)
            return;
        const result = await this.aiGatewayClient.embed(pieces);
        await this.prisma.knowledgeChunk.createMany({
            data: pieces.map((piece, index) => ({
                tenantId: this.ctx.tenantId,
                documentId,
                chunkIndex: index,
                content: piece,
                embedding: result.embeddings[index],
            })),
        });
    }
    auditCtx() {
        return {
            tenantId: this.ctx.tenantId,
            storeId: this.ctx.homeStoreId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        };
    }
};
exports.KnowledgeDocumentService = KnowledgeDocumentService;
exports.KnowledgeDocumentService = KnowledgeDocumentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_gateway_client_1.AiGatewayClient,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], KnowledgeDocumentService);
//# sourceMappingURL=knowledge-document.service.js.map