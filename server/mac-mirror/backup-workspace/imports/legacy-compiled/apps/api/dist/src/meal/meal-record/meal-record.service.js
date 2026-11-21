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
exports.MealRecordService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const SELF_SELECT_CUTOFF_HOUR = 9;
const NO_SAME_DAY_SELECT_SLOTS = ['BREAKFAST', 'MORNING_SNACK'];
const includeRecord = { defaultMealItem: true, selectedMealItem: true };
let MealRecordService = class MealRecordService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.mealRecord.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                dinerProfileId: query.dinerProfileId,
                scheduledDate: query.scheduledDate ? new Date(query.scheduledDate) : undefined,
                status: query.status,
            },
            include: includeRecord,
            orderBy: [{ scheduledDate: 'asc' }, { slot: 'asc' }],
        });
    }
    async report(query = {}) {
        const records = await this.prisma.mealRecord.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                storeId: query.storeId,
                scheduledDate: {
                    gte: query.startDate ? new Date(query.startDate) : undefined,
                    lte: query.endDate ? new Date(query.endDate) : undefined,
                },
            },
            include: includeRecord,
        });
        const bySlot = {};
        const servedByItem = new Map();
        let servedCount = 0;
        let plannedCount = 0;
        let cancelledCount = 0;
        let customSelectedCount = 0;
        let ratingSum = 0;
        let ratingCount = 0;
        for (const record of records) {
            bySlot[record.slot] = (bySlot[record.slot] ?? 0) + 1;
            if (record.isCustomSelected)
                customSelectedCount += 1;
            if (record.rating !== null) {
                ratingSum += record.rating;
                ratingCount += 1;
            }
            if (record.status === 'SERVED') {
                servedCount += 1;
                const item = record.isCustomSelected && record.selectedMealItem ? record.selectedMealItem : record.defaultMealItem;
                const existing = servedByItem.get(item.id);
                if (existing)
                    existing.count += 1;
                else
                    servedByItem.set(item.id, { name: item.name, count: 1 });
            }
            else if (record.status === 'PLANNED') {
                plannedCount += 1;
            }
            else {
                cancelledCount += 1;
            }
        }
        return {
            totalRecords: records.length,
            plannedCount,
            servedCount,
            cancelledCount,
            customSelectedCount,
            avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 100) / 100 : null,
            bySlot,
            byMealItem: [...servedByItem.entries()]
                .map(([mealItemId, v]) => ({ mealItemId, name: v.name, servedCount: v.count }))
                .sort((a, b) => b.servedCount - a.servedCount),
        };
    }
    async findOneOrThrow(id) {
        const record = await this.prisma.mealRecord.findUnique({ where: { id }, include: includeRecord });
        if (!record)
            throw new common_1.NotFoundException(`MealRecord ${id} 不存在`);
        return record;
    }
    async select(id, dto) {
        const before = await this.findOneOrThrow(id);
        if (before.status !== 'PLANNED')
            throw new common_1.BadRequestException(`排餐记录当前状态「${before.status}」不允许自选`);
        this.assertWithinSelectWindow(before.scheduledDate, before.slot);
        const mealItem = await this.prisma.mealItem.findUnique({ where: { id: dto.mealItemId } });
        if (!mealItem)
            throw new common_1.NotFoundException(`MealItem ${dto.mealItemId} 不存在`);
        await this.assertNoIngredientConflict(before.dinerProfileId, mealItem);
        const updated = await this.prisma.mealRecord.update({
            where: { id },
            data: { isCustomSelected: true, selectedMealItemId: mealItem.id, selectedAt: new Date(), version: { increment: 1 } },
            include: includeRecord,
        });
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'MealRecord',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `自选餐：${mealItem.name}`,
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async serve(id) {
        const before = await this.findOneOrThrow(id);
        if (before.status !== 'PLANNED')
            throw new common_1.BadRequestException(`排餐记录当前状态「${before.status}」不允许供餐`);
        const updated = await this.prisma.mealRecord.update({
            where: { id },
            data: { status: 'SERVED', servedAt: new Date(), servedBy: this.ctx.accountId, version: { increment: 1 } },
            include: includeRecord,
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'MealRecord',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: 'PLANNED -> SERVED',
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    async feedback(id, dto) {
        const before = await this.findOneOrThrow(id);
        if (before.status !== 'SERVED')
            throw new common_1.BadRequestException('只能对已供餐的记录评价');
        const updated = await this.prisma.mealRecord.update({
            where: { id },
            data: { rating: dto.rating, comment: dto.comment, version: { increment: 1 } },
            include: includeRecord,
        });
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'MealRecord',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: ['rating', 'comment'],
            ...this.auditCtx(before.storeId),
        });
        return updated;
    }
    assertWithinSelectWindow(scheduledDate, slot) {
        const now = new Date();
        const scheduledDayStart = new Date(Date.UTC(scheduledDate.getUTCFullYear(), scheduledDate.getUTCMonth(), scheduledDate.getUTCDate()));
        const isSameDay = now.getTime() >= scheduledDayStart.getTime() && now.getTime() < scheduledDayStart.getTime() + 24 * 60 * 60 * 1000;
        if (now.getTime() >= scheduledDayStart.getTime() + 24 * 60 * 60 * 1000) {
            throw new common_1.BadRequestException('该餐次日期已过，无法自选');
        }
        if (isSameDay) {
            if (NO_SAME_DAY_SELECT_SLOTS.includes(slot)) {
                throw new common_1.BadRequestException('早餐/早点不可当日自选，须提前一天选定');
            }
            const cutoff = new Date(scheduledDayStart.getTime());
            cutoff.setUTCHours(SELF_SELECT_CUTOFF_HOUR, 0, 0, 0);
            if (now.getTime() >= cutoff.getTime()) {
                throw new common_1.BadRequestException('已过当日9点自选截止时间');
            }
        }
    }
    async assertNoIngredientConflict(dinerProfileId, mealItem) {
        const tags = mealItem.ingredientTags ?? [];
        if (tags.length === 0)
            return;
        const restrictions = await this.prisma.dinerRestriction.findMany({
            where: { dinerProfileId, restriction: { category: 'INGREDIENT' } },
            include: { restriction: true },
        });
        const restrictedNames = restrictions.map((r) => r.restriction.name);
        const conflicts = tags.filter((tag) => restrictedNames.includes(tag));
        if (conflicts.length > 0) {
            throw new common_1.BadRequestException(`菜品「${mealItem.name}」含用膳人禁忌食材：${conflicts.join('、')}`);
        }
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
exports.MealRecordService = MealRecordService;
exports.MealRecordService = MealRecordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], MealRecordService);
//# sourceMappingURL=meal-record.service.js.map