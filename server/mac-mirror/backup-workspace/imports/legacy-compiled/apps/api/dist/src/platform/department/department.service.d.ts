import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { Department } from '@prisma/client';
export declare class DepartmentService extends BaseScopedCrudService<Department> {
    private readonly prisma;
    private readonly dataScopeService;
    protected readonly entityType = "Department";
    constructor(prisma: PrismaService, dataScopeService: DataScopeService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    create(data: {
        code?: string;
        name: string;
        storeId?: string;
        parentId?: string;
    }): Promise<Department>;
}
