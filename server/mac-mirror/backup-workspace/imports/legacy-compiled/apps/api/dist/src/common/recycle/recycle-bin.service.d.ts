import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../context/request-context.service';
import { CareStorageService } from '../../care/care-document/care-storage.service';
import { CollectOptions, TreeCollector } from './recycle-tree.util';
export declare const RECYCLE_KEEP_DAYS = 30;
export interface RecycleDeleteParams {
    entityType: 'CUSTOMER' | 'MOTHER_PROFILE';
    rootTable: string;
    rootId: string;
    title: string;
    reason?: string;
    collectOptions?: CollectOptions;
    addExtras?: (c: TreeCollector) => Promise<void>;
    beforeDelete?: (tx: Prisma.TransactionClient) => Promise<void>;
}
export declare class RecycleBinService implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    private readonly ctx;
    private readonly storage;
    private readonly auditLogService;
    private readonly logger;
    private timer?;
    constructor(prisma: PrismaService, ctx: RequestContextService, storage: CareStorageService, auditLogService: AuditLogService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    deleteToBin(p: RecycleDeleteParams): Promise<{
        itemId: string;
        summary: string;
    }>;
    list(entityType?: string): unknown;
    restore(id: string): Promise<{
        title: string;
        entityType: string;
        entityId: string;
    }>;
    purge(id: string): Promise<void>;
    purgeExpired(): Promise<number>;
    private findItem;
    private removeFiles;
}
