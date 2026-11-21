"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRecordService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const customer_service_1 = require("../../crm/customer/customer.service");
const contract_record_service_1 = require("../../contract/contract-record/contract-record.service");
const workflow_engine_service_1 = require("../../workflow/workflow-engine/workflow-engine.service");
const DEFINITION_CODE = 'PAYMENT_REFUND';
const BUSINESS_TYPE = 'PAYMENT';
let PaymentRecordService = class PaymentRecordService {
    prisma;
    customerService;
    contractRecordService;
    workflowEngineService;
    auditLogService;
    ctx;
    constructor(prisma, customerService, contractRecordService, workflowEngineService, auditLogService, ctx) {
        this.prisma = prisma;
        this.customerService = customerService;
        this.contractRecordService = contractRecordService;
        this.workflowEngineService = workflowEngineService;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    async findMany(query) {
        const where = {
            tenantId: this.ctx.tenantId,
            contractId: query.contractId,
            customerId: query.customerId,
            storeId: query.storeId,
            status: query.status,
        };
        const payments = await this.prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' } });
        return Promise.all(payments.map((p) => this.reconcileStatus(p)));
    }
    async findOneOrThrow(id) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });
        if (!payment)
            throw new common_1.NotFoundException(`Payment ${id} 不存在`);
        return this.reconcileStatus(payment);
    }
    async create(dto) {
        await this.contractRecordService.findOneOrThrow(dto.contractId);
        await this.customerService.findOneOrThrow(dto.customerId);
        const created = await this.prisma.payment.create({
            data: {
                contractId: dto.contractId,
                customerId: dto.customerId,
                storeId: dto.storeId,
                amount: dto.amount,
                method: dto.method ?? 'CASH',
                remark: dto.remark,
                paymentNo: (0, business_no_util_1.generateBusinessNo)('PY'),
                status: 'RECORDED',
                tenantId: this.ctx.tenantId,
                createdBy: this.ctx.accountId,
            },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'Payment',
            entityId: created.id,
            afterData: created,
            ...this.auditCtx(),
        });
        return created;
    }
    async requestRefund(id, refundReason, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'RECORDED') {
            throw new common_1.BadRequestException(`收款记录当前状态「${before.status}」不允许申请退款`);
        }
        await this.workflowEngineService.startInstance({
            definitionCode: DEFINITION_CODE,
            businessType: BUSINESS_TYPE,
            businessId: id,
            title: `收款 ${before.paymentNo} 退款申请`,
            storeId: before.storeId,
        }, this.actor());
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.payment.update({
            where: { id, version: expectedVersion },
            data: { status: 'PENDING_REFUND', refundReason, version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'Payment',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'RECORDED -> PENDING_REFUND',
            ...this.auditCtx(),
        });
        return updated;
    }
    async getContractSummary(contractId) {
        const contract = await this.contractRecordService.findOneOrThrow(contractId);
        const payments = await this.prisma.payment.findMany({ where: { tenantId: this.ctx.tenantId, contractId } });
        const reconciled = await Promise.all(payments.map((p) => this.reconcileStatus(p)));
        const totalCollected = reconciled
            .filter((p) => p.status === 'RECORDED' || p.status === 'PENDING_REFUND')
            .reduce((sum, p) => sum + p.amount, 0);
        const totalRefunded = reconciled.filter((p) => p.status === 'REFUNDED').reduce((sum, p) => sum + p.amount, 0);
        return {
            contractId,
            contractAmount: contract.amount,
            totalCollected,
            totalRefunded,
            balance: contract.amount - totalCollected,
        };
    }
    async reconcileStatus(payment) {
        if (payment.status !== 'PENDING_REFUND')
            return payment;
        const instance = await this.prisma.workflowInstance.findFirst({
            where: { businessType: BUSINESS_TYPE, businessId: payment.id },
            orderBy: { createdAt: 'desc' },
        });
        if (!instance)
            return payment;
        let nextStatus = null;
        if (instance.status === 'APPROVED' || instance.status === 'ARCHIVED')
            nextStatus = 'REFUNDED';
        else if (instance.status === 'REJECTED' || instance.status === 'WITHDRAWN')
            nextStatus = 'RECORDED';
        if (!nextStatus)
            return payment;
        const updated = await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: nextStatus, version: { increment: 1 } },
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'Payment',
            entityId: payment.id,
            beforeData: payment,
            afterData: updated,
            remark: `PENDING_REFUND -> ${nextStatus}（同步自 WorkflowInstance ${instance.id}）`,
            ...this.auditCtx(),
        });
        return updated;
    }
    assertVersion(before, expectedVersion) {
        if (before.version !== expectedVersion) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
    }
    actor() {
        return {
            accountId: this.ctx.accountId,
            tenantId: this.ctx.tenantId,
            storeId: this.ctx.homeStoreId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        };
    }
    auditCtx() {
        return {
            tenantId: this.ctx.tenantId,
            storeId: this.ctx.homeStoreId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        };
    }
};
exports.PaymentRecordService = PaymentRecordService;
exports.PaymentRecordService = PaymentRecordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        customer_service_1.CustomerService,
        contract_record_service_1.ContractRecordService,
        workflow_engine_service_1.WorkflowEngineService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], PaymentRecordService);
//# sourceMappingURL=payment-record.service.js.map