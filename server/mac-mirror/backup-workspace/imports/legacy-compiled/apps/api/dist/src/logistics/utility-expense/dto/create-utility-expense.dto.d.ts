import { UtilityExpenseType } from '@prisma/client';
export declare class CreateUtilityExpenseDto {
    storeId: string;
    period: string;
    expenseType: UtilityExpenseType;
    amount: number;
    remark?: string;
}
