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
exports.AiSuggestionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
let AiSuggestionService = class AiSuggestionService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.aiSuggestion.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                scenario: query.scenario,
                businessType: query.businessType,
                businessId: query.businessId,
                status: query.status,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const suggestion = await this.prisma.aiSuggestion.findUnique({ where: { id } });
        if (!suggestion)
            throw new common_1.NotFoundException(`AiSuggestion ${id} 不存在`);
        return suggestion;
    }
    async record(input) {
        const created = await this.prisma.aiSuggestion.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: input.storeId,
                scenario: input.scenario,
                businessType: input.businessType,
                businessId: input.businessId,
                inputText: input.inputText,
                outputText: input.outputText,
                modelProvider: input.modelProvider,
                modelName: input.modelName,
                usedFallback: input.usedFallback,
                latencyMs: input.latencyMs,
                escalate: input.escalate ?? false,
                createdBy: this.ctx.accountId,
            },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'AiSuggestion',
            entityId: created.id,
            afterData: created,
            remark: `AI建议(${input.scenario})：模型${input.modelProvider}/${input.modelName}，耗时${input.latencyMs}ms${input.usedFallback ? '（已降级到备用供应商）' : ''}`,
            ...this.auditCtx(input.storeId),
        });
        return created;
    }
    async accept(id, expectedVersion) {
        return this.transition(id, expectedVersion, 'ACCEPTED');
    }
    async dismiss(id, expectedVersion) {
        return this.transition(id, expectedVersion, 'DISMISSED');
    }
    async transition(id, expectedVersion, target) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== expectedVersion)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        if (before.status !== 'PENDING')
            throw new common_1.BadRequestException(`该AI建议当前状态「${before.status}」不允许此操作`);
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.aiSuggestion.update({
            where: { id, version: expectedVersion },
            data: { status: target, acceptedById: this.ctx.accountId, acceptedAt: new Date(), version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'AiSuggestion',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `PENDING -> ${target}（人工${target === 'ACCEPTED' ? '采纳' : '忽略'}）`,
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
exports.AiSuggestionService = AiSuggestionService;
exports.AiSuggestionService = AiSuggestionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], AiSuggestionService);
//# sourceMappingURL=ai-suggestion.service.js.map