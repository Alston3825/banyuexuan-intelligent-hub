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
exports.StoreService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const data_scope_service_1 = require("../../common/scope/data-scope.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
let StoreService = class StoreService {
    prisma;
    dataScopeService;
    auditLogService;
    ctx;
    constructor(prisma, dataScopeService, auditLogService, ctx) {
        this.prisma = prisma;
        this.dataScopeService = dataScopeService;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    async findMany() {
        const allowed = await this.dataScopeService.resolveAllowedStoreIds(this.ctx);
        const ids = allowed === 'ALL' ? null : [...new Set([...allowed, ...(this.ctx.homeStoreId ? [this.ctx.homeStoreId] : [])])];
        return this.prisma.store.findMany({
            where: ids ? { id: { in: ids } } : {},
        });
    }
    async findOneOrThrow(id) {
        const store = await this.prisma.store.findUnique({ where: { id } });
        if (!store)
            throw new common_1.NotFoundException(`Store ${id} 不存在`);
        return store;
    }
    async create(data) {
        const created = await this.prisma.store.create({
            data: {
                ...data,
                code: data.code ?? (0, business_no_util_1.generateBusinessNo)('ST'),
                tenantId: this.ctx.tenantId,
                createdBy: this.ctx.accountId,
                status: 'ACTIVE',
            },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'Store',
            entityId: created.id,
            afterData: created,
            ...this.auditCtx(),
        });
        return created;
    }
    async update(id, data, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        await this.dataScopeService.assertStoreAccessible(this.ctx, id);
        if (before.version !== expectedVersion) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.store.update({
            where: { id, version: expectedVersion },
            data: { ...data, version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'Store',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: Object.keys(data),
            ...this.auditCtx(),
        });
        return updated;
    }
    async close(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        await this.dataScopeService.assertStoreAccessible(this.ctx, id);
        if (before.version !== expectedVersion) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.store.update({
            where: { id, version: expectedVersion },
            data: { status: 'CLOSED', version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'VOID',
            entityType: 'Store',
            entityId: id,
            beforeData: before,
            afterData: updated,
            ...this.auditCtx(),
        });
        return updated;
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
exports.StoreService = StoreService;
exports.StoreService = StoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        data_scope_service_1.DataScopeService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], StoreService);
//# sourceMappingURL=store.service.js.map