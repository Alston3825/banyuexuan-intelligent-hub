import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { Parameter } from '@prisma/client';
export declare class ParameterService extends BaseScopedCrudService<Parameter> {
    private readonly prisma;
    private readonly dataScopeService;
    protected readonly entityType = "Parameter";
    constructor(prisma: PrismaService, dataScopeService: DataScopeService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    create(data: {
        key: string;
        value: string;
        valueType?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
        description?: string;
        storeId?: string;
    }): Promise<Parameter>;
}
