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
exports.RoomOccupancyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const integration_events_service_1 = require("../../integration/integration-events.service");
const customer_service_1 = require("../../crm/customer/customer.service");
const room_conflicts_util_1 = require("./room-conflicts.util");
let RoomOccupancyService = class RoomOccupancyService {
    prisma;
    customerService;
    auditLogService;
    ctx;
    integrationEvents;
    constructor(prisma, customerService, auditLogService, ctx, integrationEvents) {
        this.prisma = prisma;
        this.customerService = customerService;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
        this.integrationEvents = integrationEvents;
    }
    async findMany(query) {
        const where = {
            tenantId: this.ctx.tenantId,
            storeId: query.storeId,
            roomId: query.roomId,
            customerId: query.customerId,
            status: query.status,
            ...(query.from && query.to
                ? { plannedCheckIn: { lte: new Date(query.to) }, plannedCheckOut: { gte: new Date(query.from) } }
                : {}),
        };
        return this.prisma.roomOccupancy.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async findOneOrThrow(id) {
        const occupancy = await this.prisma.roomOccupancy.findUnique({ where: { id } });
        if (!occupancy)
            throw new common_1.NotFoundException(`RoomOccupancy ${id} 不存在`);
        return occupancy;
    }
    async bufferDays() {
        const p = await this.prisma.parameter.findFirst({ where: { tenantId: this.ctx.tenantId, storeId: null, key: 'room.turnover_buffer_days' } });
        const n = p ? Number(p.value) : 1;
        return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 1;
    }
    async softConflicts(roomId, checkIn, checkOut, excludeId) {
        const buf = await this.bufferDays();
        const rows = await this.prisma.roomOccupancy.findMany({
            where: { roomId, status: { in: ['RESERVED', 'CHECKED_IN'] }, id: excludeId ? { not: excludeId } : undefined },
            include: { customer: { select: { name: true } }, contract: { select: { status: true } } },
        });
        return rows
            .filter((r) => (0, room_conflicts_util_1.overlapsWithBuffer)(checkIn, checkOut, r.plannedCheckIn, r.plannedCheckOut, buf))
            .map((r) => (0, room_conflicts_util_1.brief)({
            id: r.id,
            roomId: r.roomId,
            occupancyNo: r.occupancyNo,
            status: r.status,
            plannedCheckIn: r.plannedCheckIn,
            plannedCheckOut: r.plannedCheckOut,
            createdAt: r.createdAt,
            contractId: r.contractId,
            contractStatus: r.contract?.status ?? null,
            customerName: r.customer.name,
            roomNo: '',
        }));
    }
    async findConflicts(storeId) {
        const rows = await this.prisma.roomOccupancy.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                storeId,
                status: { in: ['RESERVED', 'CHECKED_IN'] },
                plannedCheckOut: { gte: new Date(Date.now() - 3 * 86400_000) },
            },
            include: { customer: { select: { name: true } }, room: { select: { roomNo: true } }, contract: { select: { status: true } } },
        });
        const list = rows.map((r) => ({
            id: r.id,
            roomId: r.roomId,
            occupancyNo: r.occupancyNo,
            status: r.status,
            plannedCheckIn: r.plannedCheckIn,
            plannedCheckOut: r.plannedCheckOut,
            createdAt: r.createdAt,
            contractId: r.contractId,
            contractStatus: r.contract?.status ?? null,
            customerName: r.customer.name,
            roomNo: r.room.roomNo,
        }));
        return (0, room_conflicts_util_1.computeConflicts)(list, await this.bufferDays());
    }
    async freeRooms(id) {
        const occ = await this.findOneOrThrow(id);
        const buf = await this.bufferDays();
        const [rooms, active, current] = await Promise.all([
            this.prisma.room.findMany({ where: { tenantId: this.ctx.tenantId, storeId: occ.storeId, underMaintenance: false, id: { not: occ.roomId } }, include: { roomType: { select: { id: true, name: true } } }, orderBy: { roomNo: 'asc' } }),
            this.prisma.roomOccupancy.findMany({ where: { tenantId: this.ctx.tenantId, storeId: occ.storeId, status: { in: ['RESERVED', 'CHECKED_IN'] }, id: { not: id } } }),
            this.prisma.room.findUniqueOrThrow({ where: { id: occ.roomId }, select: { roomTypeId: true } }),
        ]);
        const busy = new Set(active.filter((a) => (0, room_conflicts_util_1.overlapsWithBuffer)(occ.plannedCheckIn, occ.plannedCheckOut, a.plannedCheckIn, a.plannedCheckOut, buf)).map((a) => a.roomId));
        return rooms
            .filter((r) => !busy.has(r.id))
            .map((r) => ({ id: r.id, roomNo: r.roomNo, floor: r.floor, roomTypeName: r.roomType.name, sameType: r.roomTypeId === current.roomTypeId }))
            .sort((x, y) => Number(y.sameType) - Number(x.sameType));
    }
    emitStay(type, o) {
        return this.integrationEvents.emit(o.tenantId, o.storeId, type, o.id, {
            stay_id: o.id,
            store_id: o.storeId,
            room_id: o.roomId,
            customer_id: o.customerId,
            status: o.status,
            planned_check_in: o.plannedCheckIn.toISOString(),
            planned_check_out: o.plannedCheckOut.toISOString(),
            actual_check_in_at: o.actualCheckInAt?.toISOString() ?? null,
            actual_check_out_at: o.actualCheckOutAt?.toISOString() ?? null,
        });
    }
    async changeRoom(id, roomId, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'RESERVED')
            throw new common_1.BadRequestException('已入住的客户不能直接换房，请先办理离店后重新排房');
        if (roomId === before.roomId)
            throw new common_1.BadRequestException('已经是这间房了');
        const free = await this.freeRooms(id);
        if (!free.some((r) => r.id === roomId))
            throw new common_1.ConflictException('目标房间在这段时间已有其他预订、正在维修，或不属于本门店，请换一间');
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.roomOccupancy.update({ where: { id, version: expectedVersion }, data: { roomId, version: { increment: 1 } } }));
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'RoomOccupancy',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: ['roomId'],
            remark: `换房：${before.roomId} -> ${roomId}`,
            ...this.auditCtx(),
        });
        await this.emitStay('stay.room_changed', updated);
        return updated;
    }
    async linkMotherProfile(occ) {
        const profile = await this.prisma.motherProfile.findFirst({
            where: { tenantId: this.ctx.tenantId, customerId: occ.customerId, OR: [{ occupancyId: null }, { occupancy: { status: 'CANCELLED' } }] },
            orderBy: { createdAt: 'desc' },
        });
        if (!profile)
            return;
        await this.prisma.motherProfile.update({ where: { id: profile.id }, data: { occupancyId: occ.id, version: { increment: 1 } } });
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'MotherProfile',
            entityId: profile.id,
            remark: `自动关联入住记录 ${occ.id}`,
            ...this.auditCtx(),
        });
    }
    async create(dto) {
        await this.customerService.assertActive(dto.customerId);
        if (new Date(dto.plannedCheckOut) <= new Date(dto.plannedCheckIn))
            throw new common_1.BadRequestException('计划离店日期必须晚于计划入住日期');
        const conflicts = await this.softConflicts(dto.roomId, new Date(dto.plannedCheckIn), new Date(dto.plannedCheckOut));
        const created = await this.prisma.roomOccupancy.create({
            data: {
                roomId: dto.roomId,
                storeId: dto.storeId,
                customerId: dto.customerId,
                contractId: dto.contractId,
                remark: dto.remark,
                plannedCheckIn: new Date(dto.plannedCheckIn),
                plannedCheckOut: new Date(dto.plannedCheckOut),
                occupancyNo: (0, business_no_util_1.generateBusinessNo)('RO'),
                status: 'RESERVED',
                tenantId: this.ctx.tenantId,
                createdBy: this.ctx.accountId,
            },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'RoomOccupancy',
            entityId: created.id,
            afterData: created,
            ...this.auditCtx(),
        });
        await this.linkMotherProfile(created);
        return { ...created, conflicts };
    }
    async checkInRooms(id, from, to) {
        const occ = await this.findOneOrThrow(id);
        const buf = await this.bufferDays();
        const checkIn = from ? new Date(from) : occ.plannedCheckIn;
        const checkOut = to ? new Date(to) : occ.plannedCheckOut;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [rooms, active] = await Promise.all([
            this.prisma.room.findMany({ where: { tenantId: this.ctx.tenantId, storeId: occ.storeId }, include: { roomType: { select: { name: true } } }, orderBy: { roomNo: 'asc' } }),
            this.prisma.roomOccupancy.findMany({
                where: { tenantId: this.ctx.tenantId, storeId: occ.storeId, status: { in: ['RESERVED', 'CHECKED_IN'] }, id: { not: id } },
                include: { customer: { select: { name: true } } },
            }),
        ]);
        return rooms.map((r) => {
            const mine = active.filter((a) => a.roomId === r.id);
            const inHouse = mine.find((a) => a.status === 'CHECKED_IN');
            const clash = mine.filter((a) => a.status === 'RESERVED' && (0, room_conflicts_util_1.overlapsWithBuffer)(checkIn, checkOut, a.plannedCheckIn, a.plannedCheckOut, buf));
            let state = 'FREE';
            let note = '';
            if (r.underMaintenance) {
                state = 'MAINTENANCE';
                note = r.maintenanceNote ?? '维修中';
            }
            else if (inHouse) {
                state = inHouse.plannedCheckOut < today ? 'OVERDUE' : 'IN_HOUSE';
                note = `${inHouse.customer.name} 在住，计划 ${inHouse.plannedCheckOut.toISOString().slice(0, 10)} 离店`;
            }
            else if (clash.length) {
                state = 'RESERVED_CLASH';
                note = `这段时间另有预订：${clash.map((c) => `${c.customer.name}（${c.plannedCheckIn.toISOString().slice(5, 10)}~${c.plannedCheckOut.toISOString().slice(5, 10)}）`).join('、')}`;
            }
            else if (r.needsCleaning) {
                state = 'PENDING_CLEANING';
                note = '待清扫';
            }
            return { id: r.id, roomNo: r.roomNo, floor: r.floor, roomTypeName: r.roomType.name, isBooked: r.id === occ.roomId, state, note };
        });
    }
    async checkIn(id, dto) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, dto.version);
        if (before.status !== 'RESERVED') {
            throw new common_1.BadRequestException(`占用记录当前状态「${before.status}」不允许入住`);
        }
        const roomId = dto.roomId ?? before.roomId;
        const room = await this.prisma.room.findFirst({ where: { id: roomId, tenantId: this.ctx.tenantId, storeId: before.storeId } });
        if (!room)
            throw new common_1.BadRequestException('所选房间不存在或不属于本门店');
        if (room.underMaintenance)
            throw new common_1.ConflictException(`${room.roomNo} 房正在维修，请换一间`);
        const startOfDay = (d) => {
            const x = new Date(d);
            x.setHours(0, 0, 0, 0);
            return x;
        };
        const actualIn = dto.checkInDate ? new Date(dto.checkInDate) : new Date();
        const plannedIn = dto.checkInDate ? startOfDay(actualIn) : before.plannedCheckIn;
        const plannedOut = dto.plannedCheckOut ? new Date(dto.plannedCheckOut) : before.plannedCheckOut;
        if (plannedOut <= (dto.checkInDate ? plannedIn : startOfDay(new Date())))
            throw new common_1.BadRequestException('离店日期必须晚于入住日期');
        const inHouse = await this.prisma.roomOccupancy.findFirst({
            where: { roomId, status: 'CHECKED_IN', id: { not: id } },
            include: { customer: { select: { name: true } } },
        });
        let release = null;
        if (inHouse) {
            if (inHouse.plannedCheckOut >= startOfDay(new Date())) {
                throw new common_1.ConflictException(`这间房现在还住着 ${inHouse.customer.name}（计划 ${inHouse.plannedCheckOut.toISOString().slice(0, 10)} 离店），请换一间空房，或先给 TA 办理离店`);
            }
            if (!dto.releaseOverdue) {
                throw new common_1.ConflictException(`${room.roomNo} 房上一位客户 ${inHouse.customer.name} 已过预计离店日（${inHouse.plannedCheckOut.toISOString().slice(0, 10)}）但还没办理离店。如果 TA 已经离开，请勾选“已离开，同时替 TA 办离店”`);
            }
            release = inHouse;
        }
        const conflicts = await this.softConflicts(roomId, plannedIn, plannedOut, id);
        const checkInOp = this.prisma.roomOccupancy.update({
            where: { id, version: dto.version },
            data: { status: 'CHECKED_IN', roomId, plannedCheckIn: plannedIn, plannedCheckOut: plannedOut, actualCheckInAt: actualIn, version: { increment: 1 } },
        });
        const updated = release
            ? (await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.$transaction([
                this.prisma.roomOccupancy.update({ where: { id: release.id }, data: { status: 'CHECKED_OUT', actualCheckOutAt: release.plannedCheckOut, version: { increment: 1 } } }),
                checkInOp,
            ])))[1]
            : await (0, versioned_update_util_1.runVersionedUpdate)(() => checkInOp);
        if (release) {
            await this.auditLogService.record({ action: 'STATE_TRANSITION', entityType: 'RoomOccupancy', entityId: release.id, remark: `CHECKED_IN -> CHECKED_OUT（办理 ${before.occupancyNo} 入住时确认已离开，补办离店）`, ...this.auditCtx() });
        }
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'RoomOccupancy',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `RESERVED -> CHECKED_IN${roomId !== before.roomId ? `（实际换房：${before.roomId} -> ${roomId}）` : ''}`,
            ...this.auditCtx(),
        });
        await this.linkMotherProfile(updated);
        if (release)
            await this.emitStay('stay.checked_out', { ...release, status: 'CHECKED_OUT', actualCheckOutAt: release.plannedCheckOut });
        await this.emitStay('stay.checked_in', updated);
        return { ...updated, conflicts };
    }
    async checkOut(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'CHECKED_IN') {
            throw new common_1.BadRequestException(`占用记录当前状态「${before.status}」不允许离店`);
        }
        const [updated] = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.$transaction([
            this.prisma.roomOccupancy.update({
                where: { id, version: expectedVersion },
                data: { status: 'CHECKED_OUT', actualCheckOutAt: new Date(), version: { increment: 1 } },
            }),
            this.prisma.room.update({
                where: { id: before.roomId },
                data: { needsCleaning: true },
            }),
        ]));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'RoomOccupancy',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'CHECKED_IN -> CHECKED_OUT（房间已标记待清扫）',
            ...this.auditCtx(),
        });
        await this.emitStay('stay.checked_out', updated);
        return updated;
    }
    async cancel(id, cancelReason, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'RESERVED') {
            throw new common_1.BadRequestException(`占用记录当前状态「${before.status}」不允许取消`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.roomOccupancy.update({
            where: { id, version: expectedVersion },
            data: { status: 'CANCELLED', cancelReason, version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'RoomOccupancy',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `RESERVED -> CANCELLED：${cancelReason}`,
            ...this.auditCtx(),
        });
        return updated;
    }
    async reschedule(id, dto) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, dto.version);
        if (!['RESERVED', 'CHECKED_IN'].includes(before.status)) {
            throw new common_1.BadRequestException(`占用记录当前状态「${before.status}」不允许改期`);
        }
        const plannedCheckIn = new Date(dto.plannedCheckIn);
        const plannedCheckOut = new Date(dto.plannedCheckOut);
        if (plannedCheckOut <= plannedCheckIn) {
            throw new common_1.BadRequestException('计划离店日期必须晚于计划入住日期');
        }
        const conflicts = await this.softConflicts(before.roomId, plannedCheckIn, plannedCheckOut, id);
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.roomOccupancy.update({
            where: { id, version: dto.version },
            data: { plannedCheckIn, plannedCheckOut, version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'RoomOccupancy',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: ['plannedCheckIn', 'plannedCheckOut'],
            remark: `改期：${before.plannedCheckIn.toLocaleDateString()}~${before.plannedCheckOut.toLocaleDateString()} -> ${plannedCheckIn.toLocaleDateString()}~${plannedCheckOut.toLocaleDateString()}`,
            ...this.auditCtx(),
        });
        return { ...updated, conflicts };
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
exports.RoomOccupancyService = RoomOccupancyService;
exports.RoomOccupancyService = RoomOccupancyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        customer_service_1.CustomerService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService,
        integration_events_service_1.IntegrationEventsService])
], RoomOccupancyService);
//# sourceMappingURL=room-occupancy.service.js.map