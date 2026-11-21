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
exports.LeadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const customer_service_1 = require("../customer/customer.service");
let LeadService = class LeadService {
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
            status: query.status,
            assignedToId: query.assignedToId,
            storeId: query.storeId,
        };
        return this.prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async findOneOrThrow(id) {
        const lead = await this.prisma.lead.findUnique({ where: { id } });
        if (!lead)
            throw new common_1.NotFoundException(`Lead ${id} 不存在`);
        return lead;
    }
    async create(data) {
        const { appointmentTime, ...rest } = data;
        const created = await this.prisma.lead.create({
            data: {
                ...rest,
                appointmentTime: appointmentTime ? new Date(appointmentTime) : undefined,
                leadNo: (0, business_no_util_1.generateBusinessNo)('L'),
                status: 'NEW',
                tenantId: this.ctx.tenantId,
                createdBy: this.ctx.accountId,
            },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'Lead',
            entityId: created.id,
            afterData: created,
            ...this.auditCtx(),
        });
        return created;
    }
    async update(id, data, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        const { appointmentTime, processResults, ...rest } = data;
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.lead.update({
            where: { id, version: expectedVersion },
            data: {
                ...rest,
                ...(appointmentTime !== undefined ? { appointmentTime: appointmentTime ? new Date(appointmentTime) : null } : {}),
                ...(processResults !== undefined ? { processResults } : {}),
                version: { increment: 1 },
            },
        }));
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'Lead',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: Object.keys(data),
            ...this.auditCtx(),
        });
        return updated;
    }
    async assign(id, assignedToId, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (!['NEW', 'ASSIGNED', 'FOLLOWING'].includes(before.status)) {
            throw new common_1.BadRequestException(`线索当前状态「${before.status}」不允许分配`);
        }
        const isFirstAssignment = before.status === 'NEW';
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.lead.update({
            where: { id, version: expectedVersion },
            data: {
                assignedToId,
                status: isFirstAssignment ? 'ASSIGNED' : before.status,
                version: { increment: 1 },
            },
        }));
        await this.auditLogService.record({
            action: isFirstAssignment ? 'STATE_TRANSITION' : 'REASSIGN',
            entityType: 'Lead',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: isFirstAssignment ? 'NEW -> ASSIGNED' : `改派给 ${assignedToId}`,
            ...this.auditCtx(),
        });
        return updated;
    }
    async markFollowing(id) {
        const before = await this.findOneOrThrow(id);
        if (before.status !== 'ASSIGNED')
            return;
        const updated = await this.prisma.lead.update({
            where: { id },
            data: { status: 'FOLLOWING', version: { increment: 1 } },
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'Lead',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'ASSIGNED -> FOLLOWING（首次跟进）',
            ...this.auditCtx(),
        });
    }
    async convert(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (!['ASSIGNED', 'FOLLOWING'].includes(before.status)) {
            throw new common_1.BadRequestException(`线索当前状态「${before.status}」不允许转化建档`);
        }
        const customer = await this.customerService.create({
            name: before.name,
            phone: before.phone,
            source: before.source,
            primaryStoreId: before.storeId ?? undefined,
            assignedToId: before.assignedToId ?? undefined,
        });
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.lead.update({
            where: { id, version: expectedVersion },
            data: { status: 'CONVERTED', customerId: customer.id, version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'Lead',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `CONVERTED -> Customer ${customer.id}`,
            ...this.auditCtx(),
        });
        return { lead: updated, customer };
    }
    async lose(id, lostReason, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (!['NEW', 'ASSIGNED', 'FOLLOWING'].includes(before.status)) {
            throw new common_1.BadRequestException(`线索当前状态「${before.status}」不允许标记流失`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.lead.update({
            where: { id, version: expectedVersion },
            data: { status: 'LOST', lostReason, version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'Lead',
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
exports.LeadService = LeadService;
exports.LeadService = LeadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        customer_service_1.CustomerService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], LeadService);
//# sourceMappingURL=lead.service.js.map