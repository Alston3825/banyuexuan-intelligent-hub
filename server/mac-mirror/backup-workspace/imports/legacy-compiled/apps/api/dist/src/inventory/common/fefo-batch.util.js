"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeBatchesFefo = consumeBatchesFefo;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
async function consumeBatchesFefo(tx, warehouseId, itemId, quantity) {
    const withExpiry = await tx.stockBatch.findMany({
        where: { warehouseId, itemId, quantity: { gt: 0 }, expiresAt: { not: null } },
        orderBy: { expiresAt: 'asc' },
    });
    const withoutExpiry = await tx.stockBatch.findMany({
        where: { warehouseId, itemId, quantity: { gt: 0 }, expiresAt: null },
        orderBy: { receivedAt: 'asc' },
    });
    const orderedBatches = [...withExpiry, ...withoutExpiry];
    let remaining = quantity;
    const consumed = [];
    for (const batch of orderedBatches) {
        if (remaining <= 0)
            break;
        const take = Math.min(batch.quantity, remaining);
        try {
            await tx.stockBatch.update({
                where: { id: batch.id, quantity: { gte: take } },
                data: { quantity: { decrement: take } },
            });
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                throw new common_1.ConflictException(`批次库存被并发修改，请重试（批次ID: ${batch.id}）`);
            }
            throw err;
        }
        consumed.push({ batchId: batch.id, quantity: take, unitCost: batch.unitCost, receivedAt: batch.receivedAt, expiresAt: batch.expiresAt });
        remaining -= take;
    }
    if (remaining > 0) {
        throw new common_1.BadRequestException(`批次库存不足，还差 ${remaining} 个单位无法从批次中扣减（请检查库存数据一致性）`);
    }
    return consumed;
}
//# sourceMappingURL=fefo-batch.util.js.map