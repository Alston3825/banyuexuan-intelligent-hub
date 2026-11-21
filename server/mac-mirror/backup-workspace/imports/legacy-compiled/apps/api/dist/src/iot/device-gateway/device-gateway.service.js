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
exports.DeviceGatewayService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const room_call_service_1 = require("../../room/room-call/room-call.service");
const utility_expense_service_1 = require("../../logistics/utility-expense/utility-expense.service");
const data_scope_service_1 = require("../../common/scope/data-scope.service");
let DeviceGatewayService = class DeviceGatewayService {
    prisma;
    auditLogService;
    ctx;
    roomCallService;
    utilityExpenseService;
    dataScopeService;
    constructor(prisma, auditLogService, ctx, roomCallService, utilityExpenseService, dataScopeService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
        this.roomCallService = roomCallService;
        this.utilityExpenseService = utilityExpenseService;
        this.dataScopeService = dataScopeService;
    }
    async getDeviceOrThrow(deviceId) {
        const device = await this.prisma.device.findFirst({ where: { id: deviceId, tenantId: this.ctx.tenantId } });
        if (!device)
            throw new common_1.NotFoundException(`Device ${deviceId} 不存在`);
        await this.dataScopeService.assertStoreAccessible(this.ctx, device.storeId);
        return device;
    }
    async getDeviceWithTypeOrThrow(deviceId) {
        const device = await this.prisma.device.findFirst({ where: { id: deviceId, tenantId: this.ctx.tenantId }, include: { deviceType: true } });
        if (!device)
            throw new common_1.NotFoundException(`Device ${deviceId} 不存在`);
        await this.dataScopeService.assertStoreAccessible(this.ctx, device.storeId);
        return device;
    }
    async reportEvent(dto) {
        const device = await this.getDeviceWithTypeOrThrow(dto.deviceId);
        const wasOffline = device.status !== 'ONLINE';
        await this.prisma.device.update({ where: { id: device.id }, data: { status: 'ONLINE', lastSeenAt: new Date() } });
        if (wasOffline) {
            await this.prisma.deviceConnectionLog.create({
                data: { tenantId: this.ctx.tenantId, storeId: device.storeId, deviceId: device.id, logType: 'ONLINE', createdBy: this.ctx.accountId },
            });
        }
        const payload = dto.payload ?? {};
        let businessRefType = null;
        let businessRefId = null;
        let processingError = null;
        try {
            const ref = await this.convertToBusinessRecord(device, payload);
            if (ref) {
                businessRefType = ref.type;
                businessRefId = ref.id;
            }
        }
        catch (err) {
            processingError = err instanceof Error ? err.message : String(err);
        }
        const event = await this.prisma.deviceEvent.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: device.storeId,
                deviceId: device.id,
                eventType: dto.eventType,
                payload: payload,
                processedAt: new Date(),
                businessRefType,
                businessRefId,
                processingError,
                createdBy: this.ctx.accountId,
            },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'DeviceEvent',
            entityId: event.id,
            afterData: event,
            ...this.auditCtx(),
        });
        return event;
    }
    async findEvents(query = {}) {
        if (query.storeId) {
            await this.dataScopeService.assertStoreAccessible(this.ctx, query.storeId);
            return this.prisma.deviceEvent.findMany({
                where: { tenantId: this.ctx.tenantId, deviceId: query.deviceId, storeId: query.storeId },
                orderBy: { occurredAt: 'desc' },
                take: 100,
            });
        }
        const allowed = await this.dataScopeService.resolveAllowedStoreIds(this.ctx);
        return this.prisma.deviceEvent.findMany({
            where: { tenantId: this.ctx.tenantId, deviceId: query.deviceId, storeId: allowed === 'ALL' ? undefined : { in: allowed } },
            orderBy: { occurredAt: 'desc' },
            take: 100,
        });
    }
    async getShadow(deviceId) {
        await this.getDeviceOrThrow(deviceId);
        const shadow = await this.prisma.deviceShadow.findUnique({ where: { deviceId } });
        if (!shadow)
            throw new common_1.NotFoundException(`Device ${deviceId} 的 Shadow 不存在`);
        return shadow;
    }
    async issueCommand(deviceId, desiredState) {
        const device = await this.getDeviceOrThrow(deviceId);
        const shadow = await this.prisma.deviceShadow.update({
            where: { deviceId },
            data: { desiredState: desiredState, desiredVersion: { increment: 1 }, lastCommandAt: new Date() },
        });
        await this.prisma.deviceConnectionLog.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: device.storeId,
                deviceId,
                logType: 'COMMAND_ISSUED',
                detail: desiredState,
                createdBy: this.ctx.accountId,
            },
        });
        return shadow;
    }
    async confirmCommand(deviceId) {
        const device = await this.getDeviceOrThrow(deviceId);
        const shadow = await this.prisma.deviceShadow.findUnique({ where: { deviceId } });
        if (!shadow)
            throw new common_1.NotFoundException(`Device ${deviceId} 的 Shadow 不存在`);
        if (shadow.desiredVersion === shadow.reportedVersion) {
            throw new common_1.BadRequestException('没有待确认的指令');
        }
        const updated = await this.prisma.deviceShadow.update({
            where: { deviceId },
            data: { reportedState: shadow.desiredState, reportedVersion: shadow.desiredVersion, lastReportedAt: new Date() },
        });
        await this.prisma.deviceConnectionLog.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: device.storeId,
                deviceId,
                logType: 'COMMAND_CONFIRMED',
                detail: shadow.desiredState,
                createdBy: this.ctx.accountId,
            },
        });
        return updated;
    }
    async convertToBusinessRecord(device, payload) {
        switch (device.deviceType.category) {
            case 'CALL_SERVICE':
                return this.convertCallEvent(device, payload);
            case 'UTILITY_METER':
                return this.convertUtilityMeterEvent(device, payload);
            default:
                return null;
        }
    }
    async convertCallEvent(device, payload) {
        const roomId = payload.roomId;
        if (!roomId)
            throw new common_1.BadRequestException('呼叫事件缺少 roomId');
        const occupancy = await this.prisma.roomOccupancy.findFirst({
            where: { tenantId: this.ctx.tenantId, storeId: device.storeId, roomId, status: 'CHECKED_IN' },
        });
        if (!occupancy)
            throw new common_1.BadRequestException(`房间 ${roomId} 当前没有在住占用记录，无法生成呼叫记录`);
        const reason = payload.reason || `设备呼叫（设备编号：${device.id}）`;
        const call = await this.roomCallService.create({ occupancyId: occupancy.id, reason });
        return { type: 'RoomCall', id: call.id };
    }
    async convertUtilityMeterEvent(device, payload) {
        const period = payload.period || new Date().toISOString().slice(0, 7);
        const expenseType = payload.expenseType;
        const amount = payload.amount;
        if (!expenseType || typeof amount !== 'number') {
            throw new common_1.BadRequestException('能耗计量事件缺少 expenseType 或 amount');
        }
        const existing = await this.prisma.utilityExpense.findFirst({
            where: { tenantId: this.ctx.tenantId, storeId: device.storeId, period, expenseType: expenseType },
        });
        if (existing) {
            const updated = await this.utilityExpenseService.update(existing.id, { amount }, existing.version);
            return { type: 'UtilityExpense', id: updated.id };
        }
        const created = await this.utilityExpenseService.create({ storeId: device.storeId, period, expenseType: expenseType, amount });
        return { type: 'UtilityExpense', id: created.id };
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
exports.DeviceGatewayService = DeviceGatewayService;
exports.DeviceGatewayService = DeviceGatewayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService,
        room_call_service_1.RoomCallService,
        utility_expense_service_1.UtilityExpenseService,
        data_scope_service_1.DataScopeService])
], DeviceGatewayService);
//# sourceMappingURL=device-gateway.service.js.map