import { PaymentStatus } from '@prisma/client';
export declare class QueryPaymentDto {
    contractId?: string;
    customerId?: string;
    storeId?: string;
    status?: PaymentStatus;
}
