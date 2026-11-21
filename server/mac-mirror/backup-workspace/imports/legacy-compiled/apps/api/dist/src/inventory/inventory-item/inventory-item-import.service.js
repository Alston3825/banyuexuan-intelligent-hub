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
exports.InventoryItemImportService = exports.keyOf = exports.norm = void 0;
exports.nextFreeCodes = nextFreeCodes;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const xlsx_reader_1 = require("../../common/utils/xlsx-reader");
const HEADER_ALIASES = {
    name: (h) => ['物品名称', '名称', '品名', '物品', '商品名称', '物料名称'].includes(h),
    spec: (h) => h.includes('规格') || h.includes('型号') || h.includes('尺寸'),
    brand: (h) => h.includes('品牌'),
    unit: (h) => h === '单位' || h === '计量单位',
    price: (h) => ['单价', '参考单价', '价格', '采购单价'].includes(h),
};
const norm = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
exports.norm = norm;
const keyOf = (name, spec) => `${(0, exports.norm)(name).toLowerCase()}|${(0, exports.norm)(spec).toLowerCase()}`;
exports.keyOf = keyOf;
const cellText = (v) => {
    if (v === null || v === undefined)
        return null;
    const t = (0, exports.norm)(String(v));
    return t || null;
};
let InventoryItemImportService = class InventoryItemImportService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    async preview(file) {
        let sheets;
        try {
            sheets = (0, xlsx_reader_1.readXlsx)(file);
        }
        catch (e) {
            throw new common_1.BadRequestException(`读取不了这个文件：${e.message}。请上传 Excel（.xlsx）文件`);
        }
        for (const sheet of sheets) {
            const headerIdx = sheet.rows.slice(0, 20).findIndex((r) => r.some((c) => HEADER_ALIASES.name(cellText(c) ?? '')));
            if (headerIdx < 0)
                continue;
            const header = sheet.rows[headerIdx].map((c) => cellText(c) ?? '');
            const col = (k) => header.findIndex((h) => h && HEADER_ALIASES[k](h));
            const idx = { name: col('name'), spec: col('spec'), brand: col('brand'), unit: col('unit'), price: col('price') };
            const used = new Set(Object.values(idx).filter((i) => i >= 0));
            const ignoredColumns = header.filter((h, i) => h && !used.has(i));
            const parsed = [];
            for (let r = headerIdx + 1; r < sheet.rows.length; r++) {
                const row = sheet.rows[r] ?? [];
                const name = cellText(row[idx.name]);
                if (!name)
                    continue;
                const priceRaw = idx.price >= 0 ? row[idx.price] : null;
                const price = typeof priceRaw === 'number' ? priceRaw : priceRaw ? Number(String(priceRaw).replace(/[^\d.]/g, '')) : NaN;
                parsed.push({
                    rowNo: r + 1,
                    name,
                    spec: idx.spec >= 0 ? cellText(row[idx.spec]) : null,
                    brand: idx.brand >= 0 ? cellText(row[idx.brand]) : null,
                    unit: idx.unit >= 0 ? cellText(row[idx.unit]) : null,
                    referencePrice: Number.isFinite(price) && price > 0 ? price : null,
                });
            }
            return { sheetName: sheet.name, headerRow: headerIdx + 1, ignoredColumns, rows: await this.classify(parsed) };
        }
        throw new common_1.BadRequestException('没有在表里找到“物品名称”这一列，请确认表头里有“物品名称”');
    }
    async classify(rows) {
        const existing = await this.prisma.inventoryItem.findMany({ where: { tenantId: this.ctx.tenantId }, select: { id: true, name: true, spec: true } });
        const existingByKey = new Map(existing.map((e) => [(0, exports.keyOf)(e.name, e.spec), e.id]));
        const seen = new Set();
        return rows.map((r) => {
            const key = (0, exports.keyOf)(r.name, r.spec);
            const existingId = existingByKey.get(key) ?? null;
            let status = 'NEW';
            let message = '新物品，将新增';
            if (seen.has(key)) {
                status = 'DUP_IN_FILE';
                message = '表里已有同名同规格的物品，这一行不再重复导入';
            }
            else if (existingId) {
                status = 'EXISTS';
                message = '系统里已有同名同规格的物品';
            }
            else if (!r.unit) {
                status = 'MISSING_UNIT';
                message = '缺少单位，请补上单位后再导入';
            }
            seen.add(key);
            return { ...r, status, message, existingId };
        });
    }
    async nextCodes(count) {
        return nextFreeCodes(await this.prisma.inventoryItem.findMany({ where: { tenantId: this.ctx.tenantId }, select: { code: true } }), count);
    }
    async ensureItems(rows, opts) {
        const classified = await this.classify(rows.map((r) => ({ ...r, name: (0, exports.norm)(r.name), spec: (0, exports.norm)(r.spec) || null, brand: (0, exports.norm)(r.brand) || null, unit: (0, exports.norm)(r.unit) || null })));
        const result = new Map();
        const toCreate = [];
        for (const r of classified) {
            const key = (0, exports.keyOf)(r.name, r.spec);
            if (r.existingId)
                result.set(key, r.existingId);
            else if (r.status === 'NEW' && opts.createMissing)
                toCreate.push(r);
        }
        if (toCreate.length === 0)
            return result;
        const codes = await this.nextCodes(toCreate.length);
        await this.prisma.$transaction(async (tx) => {
            for (const [i, r] of toCreate.entries()) {
                const created = await tx.inventoryItem.create({
                    data: {
                        tenantId: this.ctx.tenantId,
                        code: codes[i],
                        name: r.name,
                        unit: r.unit,
                        spec: r.spec,
                        brand: r.brand,
                        referencePrice: r.referencePrice,
                        category: (0, exports.norm)(opts.category) || null,
                        purpose: opts.purpose,
                        createdBy: this.ctx.accountId,
                    },
                });
                result.set((0, exports.keyOf)(r.name, r.spec), created.id);
            }
        });
        return result;
    }
    async commit(input) {
        if (input.items.length === 0)
            throw new common_1.BadRequestException('没有要导入的物品');
        if (input.items.length > 2000)
            throw new common_1.BadRequestException('一次最多导入 2000 个物品');
        const classified = await this.classify(input.items.map((i) => ({ ...i, name: (0, exports.norm)(i.name), spec: (0, exports.norm)(i.spec) || null, brand: (0, exports.norm)(i.brand) || null, unit: (0, exports.norm)(i.unit) || null })));
        const toCreate = classified.filter((r) => r.status === 'NEW');
        const toUpdate = input.updateExisting ? classified.filter((r) => r.status === 'EXISTS' && (r.brand || r.referencePrice !== null)) : [];
        const codes = await this.nextCodes(toCreate.length);
        const category = (0, exports.norm)(input.category) || null;
        await this.prisma.$transaction(async (tx) => {
            for (const [i, r] of toCreate.entries()) {
                await tx.inventoryItem.create({
                    data: {
                        tenantId: this.ctx.tenantId,
                        code: codes[i],
                        name: r.name,
                        unit: r.unit,
                        spec: r.spec,
                        brand: r.brand,
                        referencePrice: r.referencePrice,
                        category,
                        purpose: input.purpose,
                        createdBy: this.ctx.accountId,
                    },
                });
            }
            for (const r of toUpdate) {
                await tx.inventoryItem.update({
                    where: { id: r.existingId },
                    data: {
                        ...(r.brand ? { brand: r.brand } : {}),
                        ...(r.referencePrice !== null ? { referencePrice: r.referencePrice } : {}),
                        version: { increment: 1 },
                    },
                });
            }
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'InventoryItem',
            entityId: 'IMPORT',
            afterData: { created: toCreate.length, updated: toUpdate.length, names: toCreate.map((r) => r.name) },
            remark: `Excel 导入物品：新增 ${toCreate.length}，更新 ${toUpdate.length}`,
            tenantId: this.ctx.tenantId,
            accountId: this.ctx.accountId,
            requestId: this.ctx.requestId,
        });
        return {
            created: toCreate.length,
            updated: toUpdate.length,
            skipped: classified.length - toCreate.length - toUpdate.length,
            skippedDetail: classified.filter((r) => !toCreate.includes(r) && !toUpdate.includes(r)).map((r) => ({ rowNo: r.rowNo, name: r.name, reason: r.message })),
        };
    }
};
exports.InventoryItemImportService = InventoryItemImportService;
exports.InventoryItemImportService = InventoryItemImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], InventoryItemImportService);
function nextFreeCodes(rows, count) {
    const used = new Set(rows.map((r) => r.code.trim().toUpperCase()));
    let max = 0;
    for (const c of used) {
        const m = /^WP(\d+)$/.exec(c);
        if (m)
            max = Math.max(max, Number(m[1]));
    }
    const out = [];
    while (out.length < count) {
        max += 1;
        const code = `WP${String(max).padStart(4, '0')}`;
        if (!used.has(code))
            out.push(code);
    }
    return out;
}
//# sourceMappingURL=inventory-item-import.service.js.map