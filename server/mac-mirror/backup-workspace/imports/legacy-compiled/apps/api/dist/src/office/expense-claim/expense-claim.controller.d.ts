import { ExpenseClaimService } from './expense-claim.service';
import { CreateExpenseClaimDto } from './dto/create-expense-claim.dto';
import { QueryExpenseClaimDto } from './dto/query-expense-claim.dto';
import { CancelExpenseClaimDto } from './dto/cancel-expense-claim.dto';
import { VersionDto } from './dto/version.dto';
export declare class ExpenseClaimController {
    private readonly expenseClaimService;
    constructor(expenseClaimService: ExpenseClaimService);
    findAll(query: QueryExpenseClaimDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateExpenseClaimDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    submit(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    cancel(id: string, dto: CancelExpenseClaimDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
