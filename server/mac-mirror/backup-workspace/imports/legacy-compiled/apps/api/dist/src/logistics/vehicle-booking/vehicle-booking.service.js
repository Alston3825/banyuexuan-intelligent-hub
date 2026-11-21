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
exports.VehicleBookingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const includeBooking = { vehicle: true, applicant: { select: { id: true, realName: true } } };
let VehicleBookingService = class VehicleBookingService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    async findMany(query = {}) {
        return this.prisma.vehicleBooking.findMany({
            where: { tenantId: this.ctx.tenantId, vehicleId: query.vehicleId, storeId: query.storeId, status: query.status },
            include: includeBooking,
            orderBy: { startTime: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const booking = await this.prisma.vehicleBooking.findUnique({ where: { id }, include: includeBooking });
        if (!booking)
            throw new common_1.NotFoundException(`VehicleBooking ${id} 不存在`);
        return booking;
    }
    async create(dto) {
        const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
        if (!vehicle)
            throw new common_1.NotFoundException(`Vehicle ${dto.vehicleId} 不存在`);
        const startTime = new Date(dto.startTime);
        const endTime = new Date(dto.endTime);
        if (endTime <= startTime)
            throw new common_1.BadRequestException('结束时间必须晚于开始时间');
        const conflict = await this.prisma.vehicleBooking.findFirst({
            where: {
                tenantId: this.ctx.tenantId,
                vehicleId: dto.vehicleId,
                status: 'BOOKED',
                startTime: { lt: endTime },
                endTime: { gt: startTime },
            },
        });
        if (conflict) {
            throw new common_1.BadRequestException(`该车辆在此时段已被占用（${conflict.startTime.toLocaleString()} ~ ${conflict.endTime.toLocaleString()}），请选择其他时段或车辆`);
        }
        const created = await this.prisma.vehicleBooking.create({
            data: {
                tenantId: this.ctx.tenantId,
                vehicleId: dto.vehicleId,
                storeId: dto.storeId,
                applicantId: this.ctx.accountId,
                purpose: dto.purpose,
                startTime,
                endTime,
                createdBy: this.ctx.accountId,
            },
            include: includeBooking,
        });
        await this.auditLogService.record({ action: 'CREATE', entityType: 'VehicleBooking', entityId: created.id, afterData: created, ...this.auditCtx(dto.storeId) });
        return created;
    }
    async cancel(id, cancelReason, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== expectedVersion)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        if (before.status !== 'BOOKED')
            throw new common_1.BadRequestException(`使用申请当前状态「${before.status}」不允许取消`);
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.vehicleBooking.update({
            where: { id, version: expectedVersion },
            data: { status: 'CANCELLED', cancelReason, version: { increment: 1 } },
            include: includeBooking,
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'VehicleBooking',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `BOOKED -> CANCELLED：${cancelReason}`,
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    auditCtx(storeId) {
        return {
            tenantId: this.ctx.tenantId,
            storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        };
    }
};
exports.VehicleBookingService = VehicleBookingService;
exports.VehicleBookingService = VehicleBookingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], VehicleBookingService);
//# sourceMappingURL=vehicle-booking.service.js.map