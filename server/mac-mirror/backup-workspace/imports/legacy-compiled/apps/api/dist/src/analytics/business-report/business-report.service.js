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
exports.BusinessReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const data_scope_service_1 = require("../../common/scope/data-scope.service");
let BusinessReportService = class BusinessReportService {
    prisma;
    dataScopeService;
    ctx;
    constructor(prisma, dataScopeService, ctx) {
        this.prisma = prisma;
        this.dataScopeService = dataScopeService;
        this.ctx = ctx;
    }
    async getFinanceSummary(query) {
        const scope = await this.resolveStoreScope(query.storeId);
        const { start, endExclusive } = this.dateRange(query.startDate, query.endDate);
        const payments = await this.prisma.payment.findMany({
            where: { tenantId: this.ctx.tenantId, ...scope.where, createdAt: { gte: start, lt: endExclusive } },
            select: { amount: true, method: true, status: true },
        });
        let paymentTotalAmount = 0;
        let paymentRefundedAmount = 0;
        const byMethodMap = new Map();
        for (const p of payments) {
            if (p.status === 'REFUNDED') {
                paymentRefundedAmount += p.amount;
            }
            else {
                paymentTotalAmount += p.amount;
                byMethodMap.set(p.method, (byMethodMap.get(p.method) ?? 0) + p.amount);
            }
        }
        const customerStoreWhere = scope.storeIds === undefined ? {} : scope.storeIds.length === 1 ? { primaryStoreId: scope.storeIds[0] } : { primaryStoreId: { in: scope.storeIds } };
        const transactions = await this.prisma.customerAccountTransaction.findMany({
            where: { tenantId: this.ctx.tenantId, createdAt: { gte: start, lt: endExclusive }, account: { customer: customerStoreWhere } },
            select: { type: true, principalDelta: true, giftDelta: true },
        });
        let accountRechargeAmount = 0;
        let accountConsumeAmount = 0;
        let accountRefundAmount = 0;
        let accountAdjustAmount = 0;
        for (const t of transactions) {
            const delta = Math.abs(t.principalDelta + t.giftDelta);
            if (t.type === 'RECHARGE')
                accountRechargeAmount += delta;
            else if (t.type === 'CONSUME')
                accountConsumeAmount += delta;
            else if (t.type === 'REFUND')
                accountRefundAmount += delta;
            else if (t.type === 'ADJUST')
                accountAdjustAmount += delta;
        }
        const accounts = await this.prisma.customerAccount.findMany({
            where: { tenantId: this.ctx.tenantId, customer: customerStoreWhere },
            select: { principalBalance: true, giftBalance: true },
        });
        const accountCurrentBalance = accounts.reduce((sum, a) => sum + a.principalBalance + a.giftBalance, 0);
        return {
            storeScope: scope.label,
            paymentTotalAmount,
            paymentRefundedAmount,
            paymentByMethod: Array.from(byMethodMap.entries()).map(([method, amount]) => ({ method, amount })),
            accountRechargeAmount,
            accountConsumeAmount,
            accountRefundAmount,
            accountAdjustAmount,
            accountCurrentBalance,
        };
    }
    async getOccupancySummary(query) {
        const scope = await this.resolveStoreScope(query.storeId);
        const totalRooms = await this.prisma.room.count({ where: { tenantId: this.ctx.tenantId, ...scope.where } });
        const { start, endExclusive } = this.dateRange(query.startDate, query.endDate);
        const daily = [];
        for (let day = new Date(start); day < endExclusive; day.setUTCDate(day.getUTCDate() + 1)) {
            const dayStart = new Date(day);
            const dayEnd = new Date(day);
            dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
            const occupiedRooms = await this.prisma.roomOccupancy.count({
                where: {
                    tenantId: this.ctx.tenantId,
                    ...(scope.storeIds === undefined ? {} : scope.storeIds.length === 1 ? { storeId: scope.storeIds[0] } : { storeId: { in: scope.storeIds } }),
                    actualCheckInAt: { lt: dayEnd },
                    OR: [{ actualCheckOutAt: null }, { actualCheckOutAt: { gt: dayStart } }],
                },
            });
            daily.push({
                date: dayStart.toISOString().slice(0, 10),
                occupiedRooms,
                totalRooms,
                occupancyRate: totalRooms > 0 ? occupiedRooms / totalRooms : 0,
            });
        }
        const averageOccupancyRate = daily.length > 0 ? daily.reduce((sum, d) => sum + d.occupancyRate, 0) / daily.length : 0;
        return { storeScope: scope.label, totalRooms, averageOccupancyRate, daily };
    }
    async resolveStoreScope(storeId) {
        if (storeId) {
            await this.dataScopeService.assertStoreAccessible(this.ctx, storeId);
            return { where: { storeId }, storeIds: [storeId], label: storeId };
        }
        const allowed = await this.dataScopeService.resolveAllowedStoreIds(this.ctx);
        if (allowed === 'ALL')
            return { where: {}, storeIds: undefined, label: 'ALL' };
        if (allowed.length === 1)
            return { where: { storeId: allowed[0] }, storeIds: allowed, label: allowed[0] };
        return { where: { storeId: { in: allowed } }, storeIds: allowed, label: 'ALL' };
    }
    dateRange(startDate, endDate) {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const endExclusive = new Date(`${endDate}T00:00:00.000Z`);
        endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
        return { start, endExclusive };
    }
};
exports.BusinessReportService = BusinessReportService;
exports.BusinessReportService = BusinessReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        data_scope_service_1.DataScopeService,
        request_context_service_1.RequestContextService])
], BusinessReportService);
//# sourceMappingURL=business-report.service.js.map