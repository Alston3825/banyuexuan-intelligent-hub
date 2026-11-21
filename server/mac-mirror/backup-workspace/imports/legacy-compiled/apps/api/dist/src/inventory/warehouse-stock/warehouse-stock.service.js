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
exports.WarehouseStockService = void 0;
const common_1 = require("@nestjs/common");
const item_match_1 = require("../common/item-match");
const prisma_service_1 = require("../../prisma/prisma.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const includeStock = { warehouse: true, item: true };
let WarehouseStockService = class WarehouseStockService {
    prisma;
    ctx;
    constructor(prisma, ctx) {
        this.prisma = prisma;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.warehouseStock.findMany({
            where: {
                warehouseId: query.warehouseId,
                itemId: query.itemId,
                warehouse: { tenantId: this.ctx.tenantId },
            },
            include: includeStock,
            orderBy: { updatedAt: 'desc' },
        });
    }
    async lowStockAlerts(query = {}) {
        const stocks = await this.prisma.warehouseStock.findMany({
            where: { warehouseId: query.warehouseId, warehouse: { tenantId: this.ctx.tenantId }, item: { safetyStockThreshold: { not: null } } },
            include: includeStock,
        });
        return stocks.filter((s) => s.quantity < s.item.safetyStockThreshold);
    }
    async overview(query = {}) {
        const k = query.keyword?.trim();
        const allItems = await this.prisma.inventoryItem.findMany({
            where: { tenantId: this.ctx.tenantId, status: 'ACTIVE' },
            orderBy: { name: 'asc' },
            take: 5000,
        });
        const items = k ? allItems.filter((i) => (0, item_match_1.itemMatchesKeyword)(i, k)) : allItems;
        const stocks = await this.prisma.warehouseStock.findMany({
            where: { warehouseId: query.warehouseId, warehouse: { tenantId: this.ctx.tenantId }, itemId: { in: items.map((i) => i.id) } },
            include: { warehouse: { select: { id: true, name: true } } },
        });
        const recent = await this.prisma.stockBatch.findMany({
            where: { tenantId: this.ctx.tenantId, sourceType: 'GOODS_RECEIPT', itemId: { in: items.map((i) => i.id) } },
            select: { itemId: true, unitCost: true },
            orderBy: { receivedAt: 'desc' },
        });
        const lastCostByItem = new Map();
        for (const b of recent)
            if (!lastCostByItem.has(b.itemId))
                lastCostByItem.set(b.itemId, b.unitCost);
        const byItem = new Map();
        for (const st of stocks)
            byItem.set(st.itemId, [...(byItem.get(st.itemId) ?? []), st]);
        const rows = items.map((it) => {
            const list = byItem.get(it.id) ?? [];
            const quantity = list.reduce((sum, st) => sum + st.quantity, 0);
            const totalCost = list.reduce((sum, st) => sum + st.quantity * st.avgCost, 0);
            const threshold = it.safetyStockThreshold;
            let status = 'NO_THRESHOLD';
            if (threshold !== null)
                status = quantity <= 0 ? 'OUT' : quantity < threshold ? 'LOW' : 'OK';
            return {
                itemId: it.id,
                code: it.code,
                name: it.name,
                spec: it.spec,
                brand: it.brand,
                unit: it.unit,
                category: it.category,
                safetyStockThreshold: threshold,
                quantity,
                lastCost: lastCostByItem.get(it.id) ?? null,
                avgCost: quantity > 0 ? Math.round(totalCost / quantity) : 0,
                status,
                warehouses: list.filter((st) => st.quantity !== 0).map((st) => ({ warehouseId: st.warehouseId, warehouseName: st.warehouse.name, quantity: st.quantity })),
                updatedAt: list.reduce((m, st) => (!m || st.updatedAt > m ? st.updatedAt : m), null),
            };
        });
        const summary = {
            itemCount: rows.length,
            alertCount: rows.filter((r) => r.status === 'LOW' || r.status === 'OUT').length,
            outCount: rows.filter((r) => r.status === 'OUT').length,
            lowCount: rows.filter((r) => r.status === 'LOW').length,
            inStockCount: rows.filter((r) => r.quantity > 0).length,
            totalValue: rows.reduce((sum, r) => sum + r.quantity * r.avgCost, 0),
        };
        const rank = { OUT: 0, LOW: 1, OK: 2, NO_THRESHOLD: 3 };
        const status = query.status ?? 'ALL';
        const filtered = rows
            .filter((r) => (status === 'ALERT' ? r.status === 'LOW' || r.status === 'OUT' : status === 'LOW' ? r.status === 'LOW' : status === 'OUT' ? r.status === 'OUT' : status === 'IN_STOCK' ? r.quantity > 0 : true))
            .sort((a, b) => rank[a.status] - rank[b.status] || a.name.localeCompare(b.name, 'zh'));
        return { summary, rows: filtered };
    }
};
exports.WarehouseStockService = WarehouseStockService;
exports.WarehouseStockService = WarehouseStockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        request_context_service_1.RequestContextService])
], WarehouseStockService);
//# sourceMappingURL=warehouse-stock.service.js.map