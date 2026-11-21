import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export interface RecordAuditParams {
    action: AuditAction;
    entityType: string;
    entityId?: string | null;
    beforeData?: unknown;
    afterData?: unknown;
    changedFields?: string[];
    result?: 'SUCCESS' | 'FAILURE';
    remark?: string;
    tenantId?: string | null;
    storeId?: string | null;
    accountId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    requestId?: string | null;
}
export declare class AuditLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    record(params: RecordAuditParams): Promise<void>;
    findMany(filter: {
        tenantId?: string;
        entityType?: string;
        entityId?: string;
        accountId?: string;
        action?: AuditAction;
        from?: Date;
        to?: Date;
        page?: number;
        pageSize?: number;
    }): unknown;
}
