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
exports.CustomerAccountService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const customer_service_1 = require("../../crm/customer/customer.service");
let CustomerAccountService = class CustomerAccountService {
    prisma;
    customerService;
    auditLogService;
    ctx;
    constructor(prisma, customerService, auditLogService, ctx) {
        this.prisma = prisma;
        this.customerService = customerService;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    async findByCustomer(customerId) {
        await this.customerService.findOneOrThrow(customerId);
        const existing = await this.prisma.customerAccount.findUnique({ where: { customerId } });
        if (existing)
            return existing;
        return {
            id: '',
            tenantId: this.ctx.tenantId,
            customerId,
            principalBalance: 0,
            giftBalance: 0,
            createdAt: new Date(0),
            updatedAt: new Date(0),
            version: 0,
        };
    }
    async listTransactions(customerId) {
        const account = await this.prisma.customerAccount.findUnique({ where: { customerId } });
        if (!account)
            return [];
        return this.prisma.customerAccountTransaction.findMany({
            where: { tenantId: this.ctx.tenantId, accountId: account.id },
            orderBy: { createdAt: 'desc' },
        });
    }
    async recharge(dto) {
        const principalAmount = dto.principalAmount ?? 0;
        const giftAmount = dto.giftAmount ?? 0;
        if (principalAmount <= 0 && giftAmount <= 0) {
            throw new common_1.BadRequestException('充值本金与赠送额度至少填写一项');
        }
        await this.customerService.findOneOrThrow(dto.customerId);
        const { account, transaction } = await this.prisma.$transaction(async (tx) => {
            const account = await tx.customerAccount.upsert({
                where: { customerId: dto.customerId },
                update: {
                    principalBalance: { increment: principalAmount },
                    giftBalance: { increment: giftAmount },
                    version: { increment: 1 },
                },
                create: {
                    tenantId: this.ctx.tenantId,
                    customerId: dto.customerId,
                    principalBalance: principalAmount,
                    giftBalance: giftAmount,
                },
            });
            const transaction = await tx.customerAccountTransaction.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    accountId: account.id,
                    type: 'RECHARGE',
                    principalDelta: principalAmount,
                    giftDelta: giftAmount,
                    principalAfter: account.principalBalance,
                    giftAfter: account.giftBalance,
                    sourceType: 'MANUAL',
                    remark: dto.remark,
                    createdBy: this.ctx.accountId,
                },
            });
            return { account, transaction };
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CustomerAccountTransaction',
            entityId: transaction.id,
            afterData: transaction,
            remark: `充值：本金+${principalAmount}，赠送+${giftAmount}`,
            ...this.auditCtx(),
        });
        return account;
    }
    async consume(dto) {
        await this.customerService.findOneOrThrow(dto.customerId);
        const MAX_RETRIES = 5;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            const existing = await this.prisma.customerAccount.findUnique({ where: { customerId: dto.customerId } });
            const currentGift = existing?.giftBalance ?? 0;
            const currentPrincipal = existing?.principalBalance ?? 0;
            if (currentGift + currentPrincipal < dto.amount) {
                throw new common_1.BadRequestException(`账户余额不足，当前可用余额 ${currentGift + currentPrincipal} 分，需要消费 ${dto.amount} 分`);
            }
            const giftDeduct = Math.min(currentGift, dto.amount);
            const principalDeduct = dto.amount - giftDeduct;
            const currentVersion = existing?.version ?? 0;
            try {
                const { account, transaction } = await this.prisma.$transaction(async (tx) => {
                    const account = await tx.customerAccount.update({
                        where: { customerId: dto.customerId, version: currentVersion },
                        data: {
                            giftBalance: { decrement: giftDeduct },
                            principalBalance: { decrement: principalDeduct },
                            version: { increment: 1 },
                        },
                    });
                    const transaction = await tx.customerAccountTransaction.create({
                        data: {
                            tenantId: this.ctx.tenantId,
                            accountId: account.id,
                            type: 'CONSUME',
                            principalDelta: -principalDeduct,
                            giftDelta: -giftDeduct,
                            principalAfter: account.principalBalance,
                            giftAfter: account.giftBalance,
                            sourceType: dto.sourceType ?? 'MANUAL',
                            sourceId: dto.sourceId,
                            remark: dto.remark,
                            createdBy: this.ctx.accountId,
                        },
                    });
                    return { account, transaction };
                });
                await this.auditLogService.record({
                    action: 'CREATE',
                    entityType: 'CustomerAccountTransaction',
                    entityId: transaction.id,
                    afterData: transaction,
                    remark: `消费 ${dto.amount} 分：赠送优先扣${giftDeduct}，本金扣${principalDeduct}`,
                    ...this.auditCtx(),
                });
                return account;
            }
            catch (err) {
                if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025')
                    continue;
                throw err;
            }
        }
        throw new common_1.ConflictException('账户余额并发修改过于频繁，请重试');
    }
    async refund(dto) {
        const principalAmount = dto.principalAmount ?? 0;
        const giftAmount = dto.giftAmount ?? 0;
        if (principalAmount <= 0 && giftAmount <= 0) {
            throw new common_1.BadRequestException('退回本金与赠送额度至少填写一项');
        }
        await this.customerService.findOneOrThrow(dto.customerId);
        const { account, transaction } = await this.prisma.$transaction(async (tx) => {
            const account = await tx.customerAccount.upsert({
                where: { customerId: dto.customerId },
                update: {
                    principalBalance: { increment: principalAmount },
                    giftBalance: { increment: giftAmount },
                    version: { increment: 1 },
                },
                create: {
                    tenantId: this.ctx.tenantId,
                    customerId: dto.customerId,
                    principalBalance: principalAmount,
                    giftBalance: giftAmount,
                },
            });
            const transaction = await tx.customerAccountTransaction.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    accountId: account.id,
                    type: 'REFUND',
                    principalDelta: principalAmount,
                    giftDelta: giftAmount,
                    principalAfter: account.principalBalance,
                    giftAfter: account.giftBalance,
                    sourceType: dto.sourceType ?? 'MANUAL',
                    sourceId: dto.sourceId,
                    remark: dto.remark,
                    createdBy: this.ctx.accountId,
                },
            });
            return { account, transaction };
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CustomerAccountTransaction',
            entityId: transaction.id,
            afterData: transaction,
            remark: `退款：本金+${principalAmount}，赠送+${giftAmount}`,
            ...this.auditCtx(),
        });
        return account;
    }
    async adjust(dto) {
        await this.customerService.findOneOrThrow(dto.customerId);
        const MAX_RETRIES = 5;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            const existing = await this.prisma.customerAccount.findUnique({ where: { customerId: dto.customerId } });
            const nextPrincipal = (existing?.principalBalance ?? 0) + dto.principalDelta;
            const nextGift = (existing?.giftBalance ?? 0) + dto.giftDelta;
            if (nextPrincipal < 0 || nextGift < 0) {
                throw new common_1.BadRequestException('调整后余额不能为负');
            }
            const currentVersion = existing?.version ?? 0;
            try {
                const { account, transaction } = await this.prisma.$transaction(async (tx) => {
                    const account = existing
                        ? await tx.customerAccount.update({
                            where: { customerId: dto.customerId, version: currentVersion },
                            data: {
                                principalBalance: { increment: dto.principalDelta },
                                giftBalance: { increment: dto.giftDelta },
                                version: { increment: 1 },
                            },
                        })
                        : await tx.customerAccount.create({
                            data: {
                                tenantId: this.ctx.tenantId,
                                customerId: dto.customerId,
                                principalBalance: dto.principalDelta,
                                giftBalance: dto.giftDelta,
                            },
                        });
                    const transaction = await tx.customerAccountTransaction.create({
                        data: {
                            tenantId: this.ctx.tenantId,
                            accountId: account.id,
                            type: 'ADJUST',
                            principalDelta: dto.principalDelta,
                            giftDelta: dto.giftDelta,
                            principalAfter: account.principalBalance,
                            giftAfter: account.giftBalance,
                            sourceType: 'MANUAL',
                            remark: dto.remark,
                            createdBy: this.ctx.accountId,
                        },
                    });
                    return { account, transaction };
                });
                await this.auditLogService.record({
                    action: 'CREATE',
                    entityType: 'CustomerAccountTransaction',
                    entityId: transaction.id,
                    afterData: transaction,
                    remark: `人工调整：本金${dto.principalDelta >= 0 ? '+' : ''}${dto.principalDelta}，赠送${dto.giftDelta >= 0 ? '+' : ''}${dto.giftDelta}：${dto.remark}`,
                    ...this.auditCtx(),
                });
                return account;
            }
            catch (err) {
                if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025')
                    continue;
                throw err;
            }
        }
        throw new common_1.ConflictException('账户余额并发修改过于频繁，请重试');
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
exports.CustomerAccountService = CustomerAccountService;
exports.CustomerAccountService = CustomerAccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        customer_service_1.CustomerService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CustomerAccountService);
//# sourceMappingURL=customer-account.service.js.map