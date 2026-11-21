import { PaymentRecordService } from './payment-record.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { QueryPaymentSummaryDto } from './dto/query-payment-summary.dto';
import { RequestRefundPaymentDto } from './dto/request-refund-payment.dto';
export declare class PaymentRecordController {
    private readonly paymentRecordService;
    constructor(paymentRecordService: PaymentRecordService);
    getContractSummary(query: QueryPaymentSummaryDto): Promise<import("./payment-record.service").PaymentContractSummary>;
    findAll(query: QueryPaymentDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreatePaymentDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    requestRefund(id: string, dto: RequestRefundPaymentDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
