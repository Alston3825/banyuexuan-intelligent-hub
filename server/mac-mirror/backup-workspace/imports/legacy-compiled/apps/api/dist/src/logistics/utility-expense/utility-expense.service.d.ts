import { UtilityExpense } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { QueryUtilityExpenseDto } from './dto/query-utility-expense.dto';
export declare class UtilityExpenseService extends BaseScopedCrudService<UtilityExpense> {
    private readonly prisma;
    protected readonly entityType = "UtilityExpense";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(query?: QueryUtilityExpenseDto): Promise<UtilityExpense[]>;
    create(dto: {
        storeId: string;
        period: string;
        expenseType: UtilityExpense['expenseType'];
        amount: number;
        remark?: string;
    }): unknown;
}
