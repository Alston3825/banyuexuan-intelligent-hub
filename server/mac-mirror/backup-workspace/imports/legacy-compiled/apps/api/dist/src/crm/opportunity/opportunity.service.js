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
exports.OpportunityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const customer_service_1 = require("../customer/customer.service");
const ALLOWED_ADVANCE = {
    FOLLOWING: 'QUOTED',
    QUOTED: 'WON',
};
let OpportunityService = class OpportunityService {
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
    findMany(query) {
        const where = {
            tenantId: this.ctx.tenantId,
            stage: query.stage,
            customerId: query.customerId,
            assignedToId: query.assignedToId,
        };
        return this.prisma.salesOpportunity.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async findOneOrThrow(id) {
        const opportunity = await this.prisma.salesOpportunity.findUnique({ where: { id } });
        if (!opportunity)
            throw new common_1.NotFoundException(`SalesOpportunity ${id} 不存在`);
        return opportunity;
    }
    async create(data) {
        const customer = await this.customerService.findOneOrThrow(data.customerId);
        const created = await this.prisma.salesOpportunity.create({
            data: {
                ...data,
                assignedToId: data.assignedToId ?? customer.assignedToId ?? this.ctx.accountId,
                opportunityNo: (0, business_no_util_1.generateBusinessNo)('O'),
                stage: 'FOLLOWING',
                tenantId: this.ctx.tenantId,
                createdBy: this.ctx.accountId,
            },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'SalesOpportunity',
            entityId: created.id,
            afterData: created,
            ...this.auditCtx(),
        });
        return created;
    }
    async update(id, data, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.salesOpportunity.update({
            where: { id, version: expectedVersion },
            data: { ...data, version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'SalesOpportunity',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: Object.keys(data),
            ...this.auditCtx(),
        });
        return updated;
    }
    async advanceStage(id, targetStage, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (ALLOWED_ADVANCE[before.stage] !== targetStage) {
            throw new common_1.BadRequestException(`销售机会当前阶段「${before.stage}」不允许流转到「${targetStage}」`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.salesOpportunity.update({
            where: { id, version: expectedVersion },
            data: { stage: targetStage, version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'SalesOpportunity',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `${before.stage} -> ${targetStage}`,
            ...this.auditCtx(),
        });
        return updated;
    }
    async lose(id, lostReason, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (!['FOLLOWING', 'QUOTED'].includes(before.stage)) {
            throw new common_1.BadRequestException(`销售机会当前阶段「${before.stage}」不允许标记流失`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.salesOpportunity.update({
            where: { id, version: expectedVersion },
            data: { stage: 'LOST', lostReason, version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'SalesOpportunity',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `LOST: ${lostReason}`,
            ...this.auditCtx(),
        });
        return updated;
    }
    assertVersion(before, expectedVersion) {
        if (before.version !== expectedVersion) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
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
exports.OpportunityService = OpportunityService;
exports.OpportunityService = OpportunityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        customer_service_1.CustomerService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], OpportunityService);
//# sourceMappingURL=opportunity.service.js.map