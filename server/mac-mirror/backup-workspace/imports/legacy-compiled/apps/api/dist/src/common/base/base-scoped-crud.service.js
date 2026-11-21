"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScopedCrudService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
class BaseScopedCrudService {
    auditLogService;
    ctx;
    constructor(auditLogService, ctx) {
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    async findMany(where = {}) {
        return this.delegate.findMany({ where });
    }
    async findOneOrThrow(id) {
        const record = await this.delegate.findUnique({ where: { id } });
        if (!record)
            throw new common_1.NotFoundException(`${this.entityType} ${id} 不存在`);
        return record;
    }
    async create(data) {
        const created = await this.delegate.create({
            data: { ...data, createdBy: this.ctx.accountId },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: this.entityType,
            entityId: created.id,
            afterData: created,
            ...this.auditContext(),
        });
        return created;
    }
    async update(id, data, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== expectedVersion) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        let updated;
        try {
            updated = await this.delegate.update({
                where: { id, version: expectedVersion },
                data: { ...data, version: { increment: 1 } },
            });
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
            }
            throw err;
        }
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: this.entityType,
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: Object.keys(data),
            ...this.auditContext(),
        });
        return updated;
    }
    async delete(id) {
        const before = await this.findOneOrThrow(id);
        await this.delegate.delete({ where: { id } });
        await this.auditLogService.record({
            action: 'DELETE',
            entityType: this.entityType,
            entityId: id,
            beforeData: before,
            ...this.auditContext(),
        });
    }
    auditContext() {
        return {
            tenantId: this.ctx.tenantId,
            storeId: this.ctx.homeStoreId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        };
    }
}
exports.BaseScopedCrudService = BaseScopedCrudService;
//# sourceMappingURL=base-scoped-crud.service.js.map