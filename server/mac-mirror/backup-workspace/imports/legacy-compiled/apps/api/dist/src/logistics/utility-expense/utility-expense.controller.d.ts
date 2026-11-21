import { UtilityExpenseService } from './utility-expense.service';
import { CreateUtilityExpenseDto } from './dto/create-utility-expense.dto';
import { UpdateUtilityExpenseDto } from './dto/update-utility-expense.dto';
import { QueryUtilityExpenseDto } from './dto/query-utility-expense.dto';
export declare class UtilityExpenseController {
    private readonly utilityExpenseService;
    constructor(utilityExpenseService: UtilityExpenseService);
    findAll(query: QueryUtilityExpenseDto): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateUtilityExpenseDto): unknown;
    update(id: string, dto: UpdateUtilityExpenseDto): Promise<T>;
}
