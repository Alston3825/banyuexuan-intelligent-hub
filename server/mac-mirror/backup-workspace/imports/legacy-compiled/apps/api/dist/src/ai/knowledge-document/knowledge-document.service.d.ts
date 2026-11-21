import { KnowledgeDocument } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { AiGatewayClient } from '../ai-gateway/ai-gateway.client';
import { CreateKnowledgeDocumentDto } from './dto/create-knowledge-document.dto';
import { UpdateKnowledgeDocumentDto } from './dto/update-knowledge-document.dto';
export declare class KnowledgeDocumentService {
    private readonly prisma;
    private readonly aiGatewayClient;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, aiGatewayClient: AiGatewayClient, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(): Promise<KnowledgeDocument[]>;
    findOneOrThrow(id: string): Promise<KnowledgeDocument>;
    create(dto: CreateKnowledgeDocumentDto): Promise<KnowledgeDocument>;
    update(id: string, dto: UpdateKnowledgeDocumentDto): Promise<KnowledgeDocument>;
    delete(id: string): Promise<void>;
    private rebuildChunks;
    private auditCtx;
}
