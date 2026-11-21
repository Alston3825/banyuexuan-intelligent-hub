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
exports.RoomCallService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
let RoomCallService = class RoomCallService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.roomCall.findMany({
            where: { tenantId: this.ctx.tenantId, occupancyId: query.occupancyId, storeId: query.storeId, status: query.status },
            orderBy: { calledAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const call = await this.prisma.roomCall.findUnique({ where: { id } });
        if (!call)
            throw new common_1.NotFoundException(`RoomCall ${id} 不存在`);
        return call;
    }
    async create(dto) {
        const occupancy = await this.prisma.roomOccupancy.findUnique({ where: { id: dto.occupancyId } });
        if (!occupancy)
            throw new common_1.NotFoundException(`RoomOccupancy ${dto.occupancyId} 不存在`);
        const created = await this.prisma.roomCall.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: occupancy.storeId,
                occupancyId: dto.occupancyId,
                reason: dto.reason,
                remark: dto.remark,
                createdBy: this.ctx.accountId,
            },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'RoomCall',
            entityId: created.id,
            afterData: created,
            ...this.auditCtx(),
        });
        return created;
    }
    async handle(id) {
        const before = await this.findOneOrThrow(id);
        if (before.status !== 'PENDING') {
            throw new common_1.BadRequestException(`呼叫记录当前状态「${before.status}」不允许处理`);
        }
        const updated = await this.prisma.roomCall.update({
            where: { id },
            data: { status: 'HANDLED', handledAt: new Date(), handledBy: this.ctx.accountId },
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'RoomCall',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'PENDING -> HANDLED',
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
exports.RoomCallService = RoomCallService;
exports.RoomCallService = RoomCallService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], RoomCallService);
//# sourceMappingURL=room-call.service.js.map