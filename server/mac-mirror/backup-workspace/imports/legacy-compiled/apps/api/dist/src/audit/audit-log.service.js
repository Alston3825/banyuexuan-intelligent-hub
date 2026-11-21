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
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditLogService = class AuditLogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async record(params) {
        await this.prisma.auditLog.create({
            data: {
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId ?? null,
                beforeData: params.beforeData ?? client_1.Prisma.JsonNull,
                afterData: params.afterData ?? client_1.Prisma.JsonNull,
                changedFields: params.changedFields ?? client_1.Prisma.JsonNull,
                result: params.result ?? 'SUCCESS',
                remark: params.remark,
                tenantId: params.tenantId ?? null,
                storeId: params.storeId ?? null,
                accountId: params.accountId ?? null,
                ip: params.ip ?? null,
                userAgent: params.userAgent ? params.userAgent.slice(0, 190) : null,
                requestId: params.requestId ?? null,
            },
        });
    }
    async findMany(filter) {
        const page = filter.page && filter.page > 0 ? filter.page : 1;
        const pageSize = filter.pageSize && filter.pageSize > 0 ? Math.min(filter.pageSize, 200) : 20;
        const where = {
            tenantId: filter.tenantId,
            entityType: filter.entityType,
            entityId: filter.entityId,
            accountId: filter.accountId,
            action: filter.action,
            createdAt: filter.from || filter.to
                ? { gte: filter.from, lte: filter.to }
                : undefined,
        };
        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return { data, total, page, pageSize };
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map