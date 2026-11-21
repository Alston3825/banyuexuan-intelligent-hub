import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
export declare class RoleService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(): any;
    findOneOrThrow(id: string): unknown;
    create(data: {
        code?: string;
        name: string;
        description?: string;
    }): Promise<Role>;
    update(id: string, data: {
        name?: string;
        description?: string;
        status?: 'ACTIVE' | 'INACTIVE';
    }, expectedVersion: number): Promise<Role>;
    delete(id: string): Promise<void>;
    grantPermission(roleId: string, permissionPointId: string): unknown;
    revokePermission(roleId: string, permissionPointId: string): any;
    changePermissions(roleId: string, grant: string[], revoke: string[]): unknown;
    defaultsPreview(roleId: string): unknown;
    restoreDefaults(roleId: string): unknown;
    private assertCanGrant;
    private assertMutable;
    private auditCtx;
}
