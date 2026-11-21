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
exports.StockBatchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const includeBatch = { warehouse: true, item: true };
let StockBatchService = class StockBatchService {
    prisma;
    ctx;
    constructor(prisma, ctx) {
        this.prisma = prisma;
        this.ctx = ctx;
    }
    async findMany(query = {}) {
        const batches = await this.prisma.stockBatch.findMany({
            where: { tenantId: this.ctx.tenantId, warehouseId: query.warehouseId, itemId: query.itemId, quantity: { gt: 0 } },
            include: includeBatch,
            orderBy: { expiresAt: 'asc' },
        });
        const receiptIds = [...new Set(batches.filter((b) => b.sourceType === 'GOODS_RECEIPT').map((b) => b.sourceId))];
        const receipts = receiptIds.length ? await this.prisma.goodsReceipt.findMany({ where: { id: { in: receiptIds } }, select: { id: true, receiptNo: true } }) : [];
        const noById = new Map(receipts.map((r) => [r.id, r.receiptNo]));
        return batches.map((b) => ({ ...b, sourceNo: b.sourceType === 'GOODS_RECEIPT' ? noById.get(b.sourceId) ?? null : null }));
    }
    async expiryAlerts(query = {}) {
        const withinDays = query.withinDays ?? 7;
        const threshold = new Date();
        threshold.setDate(threshold.getDate() + withinDays);
        const batches = await this.prisma.stockBatch.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                warehouseId: query.warehouseId,
                quantity: { gt: 0 },
                expiresAt: { not: null, lte: threshold },
            },
            include: includeBatch,
            orderBy: { expiresAt: 'asc' },
        });
        const now = new Date();
        return batches.map((b) => ({ ...b, isExpired: b.expiresAt !== null && b.expiresAt < now }));
    }
};
exports.StockBatchService = StockBatchService;
exports.StockBatchService = StockBatchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        request_context_service_1.RequestContextService])
], StockBatchService);
//# sourceMappingURL=stock-batch.service.js.map