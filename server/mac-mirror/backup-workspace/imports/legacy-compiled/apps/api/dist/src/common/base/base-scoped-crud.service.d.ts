import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../context/request-context.service';
export interface ScopedCrudDelegate {
    findMany(args?: unknown): Promise<any[]>;
    findUnique(args: unknown): Promise<any | null>;
    create(args: unknown): Promise<any>;
    update(args: unknown): Promise<any>;
    delete(args: unknown): Promise<any>;
}
interface ScopedEntity {
    id: string;
    version: number;
}
export declare abstract class BaseScopedCrudService<T extends ScopedEntity> {
    protected readonly auditLogService: AuditLogService;
    protected readonly ctx: RequestContextService;
    protected abstract readonly entityType: string;
    protected abstract readonly delegate: ScopedCrudDelegate;
    constructor(auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(where?: Record<string, unknown>): Promise<T[]>;
    findOneOrThrow(id: string): Promise<T>;
    create(data: Record<string, unknown>): Promise<T>;
    update(id: string, data: Record<string, unknown>, expectedVersion: number): Promise<T>;
    delete(id: string): Promise<void>;
    protected auditContext(): {
        tenantId: string | undefined;
        storeId: string | null | undefined;
        accountId: string | undefined;
        ip: string | undefined;
        userAgent: string | undefined;
        requestId: string | undefined;
    };
}
export {};
