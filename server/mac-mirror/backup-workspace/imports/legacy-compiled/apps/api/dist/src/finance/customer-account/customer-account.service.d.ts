import { CustomerAccount, CustomerAccountTransaction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CustomerService } from '../../crm/customer/customer.service';
import { RechargeCustomerAccountDto } from './dto/recharge-customer-account.dto';
import { ConsumeCustomerAccountDto } from './dto/consume-customer-account.dto';
import { RefundCustomerAccountDto } from './dto/refund-customer-account.dto';
import { AdjustCustomerAccountDto } from './dto/adjust-customer-account.dto';
export declare class CustomerAccountService {
    private readonly prisma;
    private readonly customerService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, customerService: CustomerService, auditLogService: AuditLogService, ctx: RequestContextService);
    findByCustomer(customerId: string): Promise<CustomerAccount>;
    listTransactions(customerId: string): Promise<CustomerAccountTransaction[]>;
    recharge(dto: RechargeCustomerAccountDto): Promise<CustomerAccount>;
    consume(dto: ConsumeCustomerAccountDto): Promise<CustomerAccount>;
    refund(dto: RefundCustomerAccountDto): Promise<CustomerAccount>;
    adjust(dto: AdjustCustomerAccountDto): Promise<CustomerAccount>;
    private auditCtx;
}
