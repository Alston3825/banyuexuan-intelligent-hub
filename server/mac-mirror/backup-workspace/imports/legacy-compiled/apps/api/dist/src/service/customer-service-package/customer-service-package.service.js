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
exports.CustomerServicePackageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const includePackage = { package: true };
let CustomerServicePackageService = class CustomerServicePackageService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.customerServicePackage.findMany({
            where: { tenantId: this.ctx.tenantId, customerId: query.customerId, storeId: query.storeId },
            include: includePackage,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const record = await this.prisma.customerServicePackage.findUnique({ where: { id }, include: includePackage });
        if (!record)
            throw new common_1.NotFoundException(`CustomerServicePackage ${id} 不存在`);
        return record;
    }
    async report(query = {}) {
        const packages = await this.prisma.customerServicePackage.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                storeId: query.storeId,
                purchasedAt: {
                    gte: query.startDate ? new Date(query.startDate) : undefined,
                    lte: query.endDate ? new Date(query.endDate) : undefined,
                },
            },
            include: includePackage,
        });
        let totalAmount = 0;
        let activeCount = 0;
        let exhaustedCount = 0;
        let remainingSessionsTotal = 0;
        const byPackageMap = new Map();
        for (const pkg of packages) {
            totalAmount += pkg.amount;
            remainingSessionsTotal += pkg.remainingSessions;
            if (pkg.status === 'ACTIVE')
                activeCount += 1;
            else
                exhaustedCount += 1;
            const existing = byPackageMap.get(pkg.packageId);
            if (existing) {
                existing.soldCount += 1;
                existing.amount += pkg.amount;
            }
            else {
                byPackageMap.set(pkg.packageId, { name: pkg.package.name, soldCount: 1, amount: pkg.amount });
            }
        }
        return {
            totalSold: packages.length,
            totalAmount,
            activeCount,
            exhaustedCount,
            remainingSessionsTotal,
            byPackage: [...byPackageMap.entries()]
                .map(([packageId, v]) => ({ packageId, name: v.name, soldCount: v.soldCount, amount: v.amount }))
                .sort((a, b) => b.soldCount - a.soldCount),
        };
    }
    async create(dto) {
        const [customer, pkg] = await Promise.all([
            this.prisma.customer.findUnique({ where: { id: dto.customerId } }),
            this.prisma.servicePackage.findUnique({ where: { id: dto.packageId } }),
        ]);
        if (!customer)
            throw new common_1.NotFoundException(`Customer ${dto.customerId} 不存在`);
        if (!pkg)
            throw new common_1.NotFoundException(`ServicePackage ${dto.packageId} 不存在`);
        const created = await this.prisma.customerServicePackage.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: dto.storeId,
                customerId: dto.customerId,
                packageId: dto.packageId,
                remainingSessions: pkg.totalSessions,
                amount: dto.amount,
                createdBy: this.ctx.accountId,
            },
            include: includePackage,
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'CustomerServicePackage',
            entityId: created.id,
            afterData: created,
            tenantId: this.ctx.tenantId,
            storeId: dto.storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return created;
    }
};
exports.CustomerServicePackageService = CustomerServicePackageService;
exports.CustomerServicePackageService = CustomerServicePackageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CustomerServicePackageService);
//# sourceMappingURL=customer-service-package.service.js.map