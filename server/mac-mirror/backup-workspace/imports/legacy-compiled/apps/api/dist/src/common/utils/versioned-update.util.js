"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runVersionedUpdate = runVersionedUpdate;
exports.retryOnVersionConflict = retryOnVersionConflict;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
async function runVersionedUpdate(fn) {
    try {
        return await fn();
    }
    catch (err) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        throw err;
    }
}
async function retryOnVersionConflict(attemptFn, maxAttempts = 5) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            return await attemptFn();
        }
        catch (err) {
            const isRetryable = err instanceof client_1.Prisma.PrismaClientKnownRequestError && (err.code === 'P2025' || err.code === 'P2002');
            if (!isRetryable)
                throw err;
            if (i === maxAttempts - 1)
                throw new common_1.ConflictException('数据并发修改过于频繁，请重试');
        }
    }
    throw new common_1.ConflictException('数据并发修改过于频繁，请重试');
}
//# sourceMappingURL=versioned-update.util.js.map