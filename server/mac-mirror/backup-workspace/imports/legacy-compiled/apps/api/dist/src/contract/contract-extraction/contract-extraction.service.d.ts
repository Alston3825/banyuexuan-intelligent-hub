import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { AiGatewayClient } from '../../ai/ai-gateway/ai-gateway.client';
import { ContractStorageService } from '../contract-storage/contract-storage.service';
export declare const DEFAULT_CHECK_IN_OFFSET_DAYS = 4;
export declare function addDays(date: Date, days: number): Date;
export declare class ContractExtractionService implements OnModuleInit {
    private readonly prisma;
    private readonly storage;
    private readonly aiGateway;
    private readonly auditLogService;
    private readonly logger;
    private active;
    private readonly waiting;
    constructor(prisma: PrismaService, storage: ContractStorageService, aiGateway: AiGatewayClient, auditLogService: AuditLogService);
    onModuleInit(): Promise<void>;
    enqueue(contractId: string, tenantId: string, accountId: string): void;
    private runQueued;
    private run;
    private applyResult;
    matchRoomType(tenantId: string, text: string | null): Promise<string | null>;
}
