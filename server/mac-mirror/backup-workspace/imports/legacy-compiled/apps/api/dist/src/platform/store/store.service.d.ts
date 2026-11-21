import { Store } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
export declare class StoreService {
    private readonly prisma;
    private readonly dataScopeService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, dataScopeService: DataScopeService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(): Promise<Store[]>;
    findOneOrThrow(id: string): Promise<Store>;
    create(data: {
        code?: string;
        name: string;
        regionId: string;
        address?: string;
    }): Promise<Store>;
    update(id: string, data: {
        name?: string;
        address?: string;
        status?: 'PENDING' | 'ACTIVE' | 'CLOSED';
    }, expectedVersion: number): Promise<Store>;
    close(id: string, expectedVersion: number): Promise<Store>;
    private auditCtx;
}
