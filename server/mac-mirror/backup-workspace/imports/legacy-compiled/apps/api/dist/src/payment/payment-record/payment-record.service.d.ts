import { Payment } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CustomerService } from '../../crm/customer/customer.service';
import { ContractRecordService } from '../../contract/contract-record/contract-record.service';
import { WorkflowEngineService } from '../../workflow/workflow-engine/workflow-engine.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
export interface PaymentContractSummary {
    contractId: string;
    contractAmount: number;
    totalCollected: number;
    totalRefunded: number;
    balance: number;
}
export declare class PaymentRecordService {
    private readonly prisma;
    private readonly customerService;
    private readonly contractRecordService;
    private readonly workflowEngineService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, customerService: CustomerService, contractRecordService: ContractRecordService, workflowEngineService: WorkflowEngineService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query: QueryPaymentDto): Promise<Payment[]>;
    findOneOrThrow(id: string): Promise<Payment>;
    create(dto: CreatePaymentDto): Promise<Payment>;
    requestRefund(id: string, refundReason: string, expectedVersion: number): Promise<Payment>;
    getContractSummary(contractId: string): Promise<PaymentContractSummary>;
    private reconcileStatus;
    private assertVersion;
    private actor;
    private auditCtx;
}
