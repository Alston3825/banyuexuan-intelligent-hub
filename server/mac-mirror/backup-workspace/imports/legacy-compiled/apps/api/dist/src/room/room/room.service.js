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
exports.RoomService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const base_scoped_crud_service_1 = require("../../common/base/base-scoped-crud.service");
let RoomService = class RoomService extends base_scoped_crud_service_1.BaseScopedCrudService {
    prisma;
    entityType = 'Room';
    constructor(prisma, auditLogService, ctx) {
        super(auditLogService, ctx);
        this.prisma = prisma;
    }
    get delegate() {
        return this.prisma.room;
    }
    findMany(query = {}) {
        return this.prisma.room.findMany({
            where: { tenantId: this.ctx.tenantId, storeId: query.storeId },
            include: { roomType: true },
        });
    }
    create(data) {
        return super.create({ ...data, tenantId: this.ctx.tenantId });
    }
    async getDeleteCheck(id) {
        const room = await this.findOneOrThrow(id);
        if (room.tenantId !== this.ctx.tenantId)
            throw new common_1.NotFoundException(`Room ${id} 不存在`);
        const occupancyIds = (await this.prisma.roomOccupancy.findMany({ where: { roomId: id }, select: { id: true, status: true } }));
        const ids = occupancyIds.map((o) => o.id);
        const activeOccupancyCount = occupancyIds.filter((o) => o.status === 'RESERVED' || o.status === 'CHECKED_IN').length;
        const inOccupancy = { occupancyId: { in: ids } };
        const [motherProfiles, dinerProfiles, calls, outings, requisitions, deviceCount, canForceDelete] = await Promise.all([
            ids.length ? this.prisma.motherProfile.count({ where: inOccupancy }) : 0,
            ids.length ? this.prisma.dinerProfile.count({ where: inOccupancy }) : 0,
            ids.length ? this.prisma.roomCall.count({ where: inOccupancy }) : 0,
            ids.length ? this.prisma.roomOuting.count({ where: inOccupancy }) : 0,
            ids.length ? this.prisma.roomServiceRequisition.count({ where: inOccupancy }) : 0,
            this.prisma.device.count({ where: { roomId: id } }),
            this.ctx.hasPermission('room.room.force-delete'),
        ]);
        const blockers = [];
        if (motherProfiles)
            blockers.push(`${motherProfiles} 份母婴档案`);
        if (dinerProfiles)
            blockers.push(`${dinerProfiles} 份用膳档案`);
        if (calls)
            blockers.push(`${calls} 条呼叫记录`);
        if (outings)
            blockers.push(`${outings} 条外出记录`);
        if (requisitions)
            blockers.push(`${requisitions} 条客房服务领用记录`);
        return {
            roomId: id,
            roomNo: room.roomNo,
            occupancyTotal: ids.length,
            activeOccupancyCount,
            deviceCount,
            blockers,
            hasData: ids.length > 0 || deviceCount > 0,
            canForceDelete,
        };
    }
    async remove(id, confirmRoomNo) {
        const check = await this.getDeleteCheck(id);
        const room = await this.findOneOrThrow(id);
        if (check.activeOccupancyCount > 0) {
            throw new common_1.ConflictException(`房间「${room.roomNo}」还有 ${check.activeOccupancyCount} 条未结束的预订/入住记录，请先办理离店或取消预订后再删除`);
        }
        if (check.blockers.length > 0) {
            throw new common_1.ConflictException(`房间「${room.roomNo}」的历史记录下关联了${check.blockers.join('、')}，删除会造成这些数据丢失，无法删除；如不再使用，请改用"标记维修"停用该房间`);
        }
        if (check.hasData) {
            if (!check.canForceDelete) {
                throw new common_1.ForbiddenException(`房间「${room.roomNo}」已有 ${check.occupancyTotal} 条预订/入住记录${check.deviceCount ? `、${check.deviceCount} 台绑定设备` : ''}，属于正式数据，删除需要管理员权限，请联系管理员`);
            }
            if (confirmRoomNo !== room.roomNo) {
                throw new common_1.BadRequestException(`该房间已有正式数据，删除前请输入房间号「${room.roomNo}」确认`);
            }
        }
        const occupancies = await this.prisma.roomOccupancy.findMany({
            where: { roomId: id },
            select: { id: true, customerId: true, status: true, plannedCheckIn: true, plannedCheckOut: true },
        });
        await this.prisma.$transaction([
            this.prisma.device.updateMany({ where: { roomId: id }, data: { roomId: null } }),
            this.prisma.roomOccupancy.deleteMany({ where: { roomId: id } }),
            this.prisma.room.delete({ where: { id } }),
        ]);
        await this.auditLogService.record({
            action: 'DELETE',
            entityType: 'Room',
            entityId: id,
            beforeData: { room, occupancies },
            remark: check.hasData
                ? `管理员删除有数据的房间：连带删除 ${occupancies.length} 条历史占用记录，解绑 ${check.deviceCount} 台设备`
                : '删除空房间',
            ...this.auditCtx(),
        });
    }
    async setMaintenance(id, underMaintenance, note, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== expectedVersion) {
            throw new common_1.BadRequestException('数据已被他人修改，请刷新后重试');
        }
        const updated = await this.prisma.room.update({
            where: { id },
            data: { underMaintenance, maintenanceNote: note ?? null, version: { increment: 1 } },
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'Room',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: underMaintenance ? '置为维修中' : '解除维修标志',
            ...this.auditCtx(),
        });
        return updated;
    }
    async markCleaned(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== expectedVersion) {
            throw new common_1.BadRequestException('数据已被他人修改，请刷新后重试');
        }
        if (!before.needsCleaning) {
            throw new common_1.BadRequestException('房间当前不处于待清扫状态');
        }
        const updated = await this.prisma.room.update({
            where: { id },
            data: { needsCleaning: false, version: { increment: 1 } },
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'Room',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: '完成清扫',
            ...this.auditCtx(),
        });
        return updated;
    }
    async getBoard(query) {
        const date = query.date ? new Date(query.date) : new Date();
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        const rooms = await this.prisma.room.findMany({
            where: { tenantId: this.ctx.tenantId, storeId: query.storeId },
            include: { roomType: true },
            orderBy: [{ floor: 'asc' }, { roomNo: 'asc' }],
        });
        const occupancies = await this.prisma.roomOccupancy.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                storeId: query.storeId,
                status: { in: ['CHECKED_IN', 'RESERVED'] },
                plannedCheckIn: { lt: endOfDay },
                plannedCheckOut: { gt: startOfDay },
            },
            include: {
                customer: { include: { assignedTo: { select: { realName: true } } } },
                contract: {
                    select: {
                        id: true,
                        paperNo: true,
                        orientation: true,
                        careMode: true,
                        inHouseDays: true,
                        homeServiceDays: true,
                        signer: { select: { realName: true } },
                    },
                },
            },
        });
        const occIds = occupancies.map((o) => o.id);
        const profiles = occIds.length
            ? await this.prisma.motherProfile.findMany({
                where: { tenantId: this.ctx.tenantId, occupancyId: { in: occIds } },
                select: { id: true, occupancyId: true, primaryNurse: { select: { realName: true } } },
            })
            : [];
        const plans = profiles.length
            ? await this.prisma.carePlanVersion.findMany({
                where: { tenantId: this.ctx.tenantId, motherProfileId: { in: profiles.map((p) => p.id) }, babyProfileId: null, status: 'ACTIVE' },
                select: { motherProfileId: true, level: true },
            })
            : [];
        const levelByProfile = new Map(plans.map((p) => [p.motherProfileId, p.level]));
        const careByOccupancy = new Map(profiles.map((p) => [p.occupancyId, { level: levelByProfile.get(p.id) ?? null, nurseName: p.primaryNurse?.realName ?? null }]));
        const occupancyByRoomId = new Map();
        for (const occ of occupancies) {
            const existing = occupancyByRoomId.get(occ.roomId);
            if (!existing || (occ.status === 'CHECKED_IN' && existing.status !== 'CHECKED_IN')) {
                occupancyByRoomId.set(occ.roomId, occ);
            }
        }
        return rooms.map((room) => {
            const occ = occupancyByRoomId.get(room.id);
            let status;
            if (room.underMaintenance)
                status = 'MAINTENANCE';
            else if (occ?.status === 'CHECKED_IN')
                status = 'OCCUPIED';
            else if (occ?.status === 'RESERVED')
                status = 'RESERVED';
            else if (room.needsCleaning)
                status = 'PENDING_CLEANING';
            else
                status = 'VACANT';
            return {
                room,
                status,
                customerId: occ?.customerId ?? null,
                customerName: occ?.customer.name ?? null,
                occupancyId: occ?.id ?? null,
                plannedCheckIn: occ?.plannedCheckIn ?? null,
                plannedCheckOut: occ?.plannedCheckOut ?? null,
                expectedDueDate: occ?.customer.expectedDueDate ?? null,
                signerName: occ?.contract?.signer?.realName ?? occ?.customer.assignedTo?.realName ?? null,
                actualCheckInAt: occ?.actualCheckInAt ?? null,
                careBrief: occ ? (careByOccupancy.get(occ.id) ?? null) : null,
                contract: occ?.contract
                    ? {
                        id: occ.contract.id,
                        paperNo: occ.contract.paperNo,
                        orientation: occ.contract.orientation,
                        careMode: occ.contract.careMode,
                        inHouseDays: occ.contract.inHouseDays,
                        homeServiceDays: occ.contract.homeServiceDays,
                    }
                    : null,
            };
        });
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
exports.RoomService = RoomService;
exports.RoomService = RoomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], RoomService);
//# sourceMappingURL=room.service.js.map