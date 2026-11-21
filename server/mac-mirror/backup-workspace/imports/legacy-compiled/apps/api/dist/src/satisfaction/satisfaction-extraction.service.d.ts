import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiGatewayClient } from '../ai/ai-gateway/ai-gateway.client';
import { CareStorageService } from '../care/care-document/care-storage.service';
export declare function parseSheetDate(raw: unknown, now?: any): Date | null;
export declare class SatisfactionExtractionService implements OnModuleInit {
    private readonly prisma;
    private readonly storage;
    private readonly aiGateway;
    private readonly logger;
    private active;
    private readonly waiting;
    constructor(prisma: PrismaService, storage: CareStorageService, aiGateway: AiGatewayClient);
    onModuleInit(): Promise<void>;
    enqueue(id: string): void;
    private runQueued;
    private run;
}
