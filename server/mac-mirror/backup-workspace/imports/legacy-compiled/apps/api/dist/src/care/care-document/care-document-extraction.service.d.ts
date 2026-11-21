import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiGatewayClient } from '../../ai/ai-gateway/ai-gateway.client';
import { CareStorageService } from './care-storage.service';
export declare class CareDocumentExtractionService implements OnModuleInit {
    private readonly prisma;
    private readonly storage;
    private readonly aiGateway;
    private readonly logger;
    private active;
    private readonly waiting;
    constructor(prisma: PrismaService, storage: CareStorageService, aiGateway: AiGatewayClient);
    onModuleInit(): Promise<void>;
    isStructured(docType: string): boolean;
    private aiSpec;
    private dropOtherSexFields;
    private nurseRoster;
    enqueue(documentId: string): void;
    private runQueued;
    private run;
}
