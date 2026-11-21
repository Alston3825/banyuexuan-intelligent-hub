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
exports.RoomOutingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
let RoomOutingService = class RoomOutingService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.roomOuting.findMany({
            where: { tenantId: this.ctx.tenantId, occupancyId: query.occupancyId, storeId: query.storeId, status: query.status },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const outing = await this.prisma.roomOuting.findUnique({ where: { id } });
        if (!outing)
            throw new common_1.NotFoundException(`RoomOuting ${id} 不存在`);
        return outing;
    }
    async create(dto) {
        const occupancy = await this.prisma.roomOccupancy.findUnique({ where: { id: dto.occupancyId } });
        if (!occupancy)
            throw new common_1.NotFoundException(`RoomOccupancy ${dto.occupancyId} 不存在`);
        const created = await this.prisma.roomOuting.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: occupancy.storeId,
                occupancyId: dto.occupancyId,
                plannedOutAt: new Date(dto.plannedOutAt),
                plannedBackAt: new Date(dto.plannedBackAt),
                riskNote: dto.riskNote,
                createdBy: this.ctx.accountId,
            },
        });
        await this.auditLogService.record({ action: 'CREATE', entityType: 'RoomOuting', entityId: created.id, afterData: created, ...this.auditCtx() });
        return created;
    }
    async checkOut(id, expectedVersion) {
        const before = await this.assertVersion(id, expectedVersion);
        if (before.status !== 'PLANNED')
            throw new common_1.BadRequestException(`外出记录当前状态「${before.status}」不允许签出`);
        return this.transition(before, 'OUT', { actualOutAt: new Date() }, 'PLANNED -> OUT', expectedVersion);
    }
    async checkBack(id, expectedVersion) {
        const before = await this.assertVersion(id, expectedVersion);
        if (before.status !== 'OUT')
            throw new common_1.BadRequestException(`外出记录当前状态「${before.status}」不允许签回`);
        return this.transition(before, 'RETURNED', { actualBackAt: new Date() }, 'OUT -> RETURNED', expectedVersion);
    }
    async cancel(id, cancelReason, expectedVersion) {
        const before = await this.assertVersion(id, expectedVersion);
        if (before.status !== 'PLANNED')
            throw new common_1.BadRequestException(`外出记录当前状态「${before.status}」不允许取消`);
        return this.transition(before, 'CANCELLED', { cancelReason }, `PLANNED -> CANCELLED：${cancelReason}`, expectedVersion);
    }
    async assertVersion(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== expectedVersion)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        return before;
    }
    async transition(before, status, extra, remark, expectedVersion) {
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.roomOuting.update({
            where: { id: before.id, version: expectedVersion },
            data: { status, ...extra, version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'RoomOuting',
            entityId: before.id,
            beforeData: before,
            afterData: updated,
            remark,
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
exports.RoomOutingService = RoomOutingService;
exports.RoomOutingService = RoomOutingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], RoomOutingService);
//# sourceMappingURL=room-outing.service.js.map