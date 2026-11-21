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
exports.ServiceAppointmentService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const includeAppointment = { product: true, therapist: true, sourcePackage: { include: { package: true } } };
let ServiceAppointmentService = class ServiceAppointmentService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.serviceAppointment.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                customerId: query.customerId,
                therapistId: query.therapistId,
                storeId: query.storeId,
                status: query.status,
            },
            include: includeAppointment,
            orderBy: { scheduledAt: 'desc' },
        });
    }
    async report(query = {}) {
        const appointments = await this.prisma.serviceAppointment.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                storeId: query.storeId,
                scheduledAt: {
                    gte: query.startDate ? new Date(query.startDate) : undefined,
                    lte: query.endDate ? new Date(query.endDate) : undefined,
                },
            },
            include: { product: true, therapist: true },
        });
        let bookedCount = 0;
        let completedCount = 0;
        let cancelledCount = 0;
        let noShowCount = 0;
        let ratingSum = 0;
        let ratingCount = 0;
        const byProductMap = new Map();
        const byTherapistMap = new Map();
        for (const appointment of appointments) {
            if (appointment.rating !== null) {
                ratingSum += appointment.rating;
                ratingCount += 1;
            }
            switch (appointment.status) {
                case 'BOOKED':
                    bookedCount += 1;
                    break;
                case 'COMPLETED': {
                    completedCount += 1;
                    const product = byProductMap.get(appointment.productId);
                    if (product)
                        product.count += 1;
                    else
                        byProductMap.set(appointment.productId, { name: appointment.product.name, count: 1 });
                    if (appointment.therapistId && appointment.therapist) {
                        const therapist = byTherapistMap.get(appointment.therapistId);
                        if (therapist)
                            therapist.count += 1;
                        else
                            byTherapistMap.set(appointment.therapistId, { name: appointment.therapist.name, count: 1 });
                    }
                    break;
                }
                case 'CANCELLED':
                    cancelledCount += 1;
                    break;
                case 'NO_SHOW':
                    noShowCount += 1;
                    break;
            }
        }
        return {
            totalAppointments: appointments.length,
            bookedCount,
            completedCount,
            cancelledCount,
            noShowCount,
            avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 100) / 100 : null,
            byProduct: [...byProductMap.entries()]
                .map(([productId, v]) => ({ productId, name: v.name, completedCount: v.count }))
                .sort((a, b) => b.completedCount - a.completedCount),
            byTherapist: [...byTherapistMap.entries()]
                .map(([therapistId, v]) => ({ therapistId, name: v.name, completedCount: v.count }))
                .sort((a, b) => b.completedCount - a.completedCount),
        };
    }
    async findOneOrThrow(id) {
        const appointment = await this.prisma.serviceAppointment.findUnique({ where: { id }, include: includeAppointment });
        if (!appointment)
            throw new common_1.NotFoundException(`ServiceAppointment ${id} 不存在`);
        return appointment;
    }
    async create(dto) {
        const [customer, product] = await Promise.all([
            this.prisma.customer.findUnique({ where: { id: dto.customerId } }),
            this.prisma.serviceProduct.findUnique({ where: { id: dto.productId } }),
        ]);
        if (!customer)
            throw new common_1.NotFoundException(`Customer ${dto.customerId} 不存在`);
        if (!product)
            throw new common_1.NotFoundException(`ServiceProduct ${dto.productId} 不存在`);
        if (dto.sourcePackageId) {
            const sourcePackage = await this.prisma.customerServicePackage.findUnique({ where: { id: dto.sourcePackageId } });
            if (!sourcePackage)
                throw new common_1.NotFoundException(`CustomerServicePackage ${dto.sourcePackageId} 不存在`);
            if (sourcePackage.customerId !== dto.customerId)
                throw new common_1.BadRequestException('服务包不属于该客户');
            if (sourcePackage.status !== 'ACTIVE' || sourcePackage.remainingSessions <= 0) {
                throw new common_1.BadRequestException('该服务包已用完或已失效，无法预约');
            }
        }
        const created = await this.prisma.serviceAppointment.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: dto.storeId,
                appointmentNo: (0, business_no_util_1.generateBusinessNo)('SA'),
                customerId: dto.customerId,
                productId: dto.productId,
                therapistId: dto.therapistId,
                sourcePackageId: dto.sourcePackageId,
                scheduledAt: new Date(dto.scheduledAt),
                durationMinutes: dto.durationMinutes,
                createdBy: this.ctx.accountId,
            },
            include: includeAppointment,
        });
        await this.auditLogService.record({ action: 'CREATE', entityType: 'ServiceAppointment', entityId: created.id, afterData: created, ...this.auditCtx(dto.storeId) });
        return created;
    }
    async complete(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== expectedVersion)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        if (before.status !== 'BOOKED')
            throw new common_1.BadRequestException(`预约当前状态「${before.status}」不允许完成`);
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.$transaction(async (tx) => {
            if (before.sourcePackageId) {
                const sourcePackage = await tx.customerServicePackage.findUnique({ where: { id: before.sourcePackageId } });
                if (!sourcePackage || sourcePackage.status !== 'ACTIVE' || sourcePackage.remainingSessions <= 0) {
                    throw new common_1.BadRequestException('该服务包已用完或已失效，无法消项');
                }
                let updatedPackage;
                try {
                    updatedPackage = await tx.customerServicePackage.update({
                        where: { id: sourcePackage.id, remainingSessions: { gt: 0 } },
                        data: { remainingSessions: { decrement: 1 }, version: { increment: 1 } },
                    });
                }
                catch (err) {
                    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                        throw new common_1.BadRequestException('该服务包已用完或已失效，无法消项');
                    }
                    throw err;
                }
                if (updatedPackage.remainingSessions === 0 && updatedPackage.status !== 'EXHAUSTED') {
                    await tx.customerServicePackage.update({ where: { id: sourcePackage.id }, data: { status: 'EXHAUSTED' } });
                }
            }
            return tx.serviceAppointment.update({
                where: { id, version: expectedVersion },
                data: { status: 'COMPLETED', completedAt: new Date(), version: { increment: 1 } },
                include: includeAppointment,
            });
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'ServiceAppointment',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'BOOKED -> COMPLETED' + (before.sourcePackageId ? '（消耗服务包1次）' : ''),
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async cancel(id, dto) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== dto.version)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        if (before.status !== 'BOOKED')
            throw new common_1.BadRequestException(`预约当前状态「${before.status}」不允许取消`);
        const status = dto.noShow ? 'NO_SHOW' : 'CANCELLED';
        const updated = await this.prisma.serviceAppointment.update({
            where: { id },
            data: { status, cancelReason: dto.cancelReason, version: { increment: 1 } },
            include: includeAppointment,
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'ServiceAppointment',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `BOOKED -> ${status}：${dto.cancelReason}`,
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async feedback(id, dto) {
        const before = await this.findOneOrThrow(id);
        if (before.status !== 'COMPLETED')
            throw new common_1.BadRequestException('只能对已完成的预约评价');
        const updated = await this.prisma.serviceAppointment.update({
            where: { id },
            data: { rating: dto.rating, comment: dto.comment, version: { increment: 1 } },
            include: includeAppointment,
        });
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'ServiceAppointment',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: ['rating', 'comment'],
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
exports.ServiceAppointmentService = ServiceAppointmentService;
exports.ServiceAppointmentService = ServiceAppointmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], ServiceAppointmentService);
//# sourceMappingURL=service-appointment.service.js.map