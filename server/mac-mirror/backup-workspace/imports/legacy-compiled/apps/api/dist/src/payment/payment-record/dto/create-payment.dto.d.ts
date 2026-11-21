import { PaymentMethod } from '@prisma/client';
export declare class CreatePaymentDto {
    contractId: string;
    customerId: string;
    storeId: string;
    amount: number;
    method?: PaymentMethod;
    remark?: string;
}
