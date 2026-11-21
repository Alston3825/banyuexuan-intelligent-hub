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
exports.ScheduleEntryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const includeEntry = {
    employeeProfile: { include: { account: { select: { id: true, realName: true } } } },
    shiftDefinition: true,
};
let ScheduleEntryService = class ScheduleEntryService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.scheduleEntry.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                storeId: query.storeId,
                employeeProfileId: query.employeeProfileId,
                workDate: {
                    gte: query.startDate ? new Date(query.startDate) : undefined,
                    lte: query.endDate ? new Date(query.endDate) : undefined,
                },
            },
            include: includeEntry,
            orderBy: { workDate: 'asc' },
        });
    }
    async findOneOrThrow(id) {
        const entry = await this.prisma.scheduleEntry.findUnique({ where: { id }, include: includeEntry });
        if (!entry)
            throw new common_1.NotFoundException(`ScheduleEntry ${id} 不存在`);
        return entry;
    }
    async create(dto) {
        const [employeeProfile, shiftDefinition] = await Promise.all([
            this.prisma.employeeProfile.findUnique({ where: { id: dto.employeeProfileId } }),
            this.prisma.shiftDefinition.findUnique({ where: { id: dto.shiftDefinitionId } }),
        ]);
        if (!employeeProfile)
            throw new common_1.NotFoundException(`EmployeeProfile ${dto.employeeProfileId} 不存在`);
        if (!shiftDefinition)
            throw new common_1.NotFoundException(`ShiftDefinition ${dto.shiftDefinitionId} 不存在`);
        const existing = await this.prisma.scheduleEntry.findUnique({
            where: { employeeProfileId_workDate: { employeeProfileId: dto.employeeProfileId, workDate: new Date(dto.workDate) } },
        });
        if (existing)
            throw new common_1.BadRequestException('该员工当天已有排班记录，请编辑或删除后重新登记');
        const created = await this.prisma.scheduleEntry.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: dto.storeId,
                employeeProfileId: dto.employeeProfileId,
                workDate: new Date(dto.workDate),
                shiftDefinitionId: dto.shiftDefinitionId,
                remark: dto.remark,
                createdBy: this.ctx.accountId,
            },
            include: includeEntry,
        });
        await this.auditLogService.record({ action: 'CREATE', entityType: 'ScheduleEntry', entityId: created.id, afterData: created, ...this.auditCtx(dto.storeId) });
        return created;
    }
    async update(id, dto) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== dto.version)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        if (dto.shiftDefinitionId) {
            const shiftDefinition = await this.prisma.shiftDefinition.findUnique({ where: { id: dto.shiftDefinitionId } });
            if (!shiftDefinition)
                throw new common_1.NotFoundException(`ShiftDefinition ${dto.shiftDefinitionId} 不存在`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.scheduleEntry.update({
            where: { id, version: dto.version },
            data: { shiftDefinitionId: dto.shiftDefinitionId, remark: dto.remark, version: { increment: 1 } },
            include: includeEntry,
        }));
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'ScheduleEntry',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: ['shiftDefinitionId', 'remark'],
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async delete(id) {
        const before = await this.findOneOrThrow(id);
        await this.prisma.scheduleEntry.delete({ where: { id } });
        await this.auditLogService.record({ action: 'DELETE', entityType: 'ScheduleEntry', entityId: id, beforeData: before, ...this.auditCtx(before.storeId) });
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
exports.ScheduleEntryService = ScheduleEntryService;
exports.ScheduleEntryService = ScheduleEntryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], ScheduleEntryService);
//# sourceMappingURL=schedule-entry.service.js.map