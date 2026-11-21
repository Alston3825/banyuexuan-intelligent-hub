import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
import { PasswordService } from '../../auth/password.service';
export declare class AccountService {
    private readonly prisma;
    private readonly dataScopeService;
    private readonly auditLogService;
    private readonly passwordService;
    private readonly ctx;
    constructor(prisma: PrismaService, dataScopeService: DataScopeService, auditLogService: AuditLogService, passwordService: PasswordService, ctx: RequestContextService);
    findMany(): unknown;
    findOneOrThrow(id: string): unknown;
    private assertPhoneFree;
    private assertEmployeeNoFree;
    create(data: {
        username: string;
        realName: string;
        password: string;
        phone?: string;
        email?: string;
        storeId?: string;
        departmentId?: string;
        teamId?: string;
        positionId?: string;
        status?: 'ACTIVE' | 'DISABLED';
        employeeNo?: string;
        hireDate?: string;
    }): unknown;
    update(id: string, data: {
        realName?: string;
        phone?: string;
        email?: string;
        storeId?: string | null;
        departmentId?: string | null;
        teamId?: string | null;
        positionId?: string | null;
        status?: 'ACTIVE' | 'DISABLED' | 'LOCKED';
    }, expectedVersion: number): unknown;
    resetPassword(id: string, newPassword: string): Promise<void>;
    assignRole(accountId: string, roleId: string, scopeType: 'TENANT' | 'REGION' | 'STORE' | 'DEPARTMENT' | 'TEAM' | 'SELF', scopeIds?: string[]): unknown;
    remove(id: string): Promise<void>;
    revokeRoleAssignment(accountId: string, assignmentId: string): unknown;
    private auditCtx;
}
