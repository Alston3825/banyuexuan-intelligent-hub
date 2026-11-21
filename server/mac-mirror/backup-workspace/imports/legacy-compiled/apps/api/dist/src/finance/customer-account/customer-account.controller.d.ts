import { CustomerAccountService } from './customer-account.service';
import { RechargeCustomerAccountDto } from './dto/recharge-customer-account.dto';
import { ConsumeCustomerAccountDto } from './dto/consume-customer-account.dto';
import { RefundCustomerAccountDto } from './dto/refund-customer-account.dto';
import { AdjustCustomerAccountDto } from './dto/adjust-customer-account.dto';
export declare class CustomerAccountController {
    private readonly customerAccountService;
    constructor(customerAccountService: CustomerAccountService);
    findByCustomer(customerId: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    listTransactions(customerId: string): Promise<{}>;
    recharge(dto: RechargeCustomerAccountDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    consume(dto: ConsumeCustomerAccountDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    refund(dto: RefundCustomerAccountDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    adjust(dto: AdjustCustomerAccountDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
