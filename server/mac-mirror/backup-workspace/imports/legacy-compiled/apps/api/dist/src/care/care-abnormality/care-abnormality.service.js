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
exports.CareAbnormalityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const follow_up_service_1 = require("../../crm/follow-up/follow-up.service");
const includeAbnormality = {
    field: true,
    careRecord: true,
};
let CareAbnormalityService = class CareAbnormalityService {
    prisma;
    followUpService;
    auditLogService;
    ctx;
    constructor(prisma, followUpService, auditLogService, ctx) {
        this.prisma = prisma;
        this.followUpService = followUpService;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(query = {}) {
        return this.prisma.careAbnormality.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                motherProfileId: query.motherProfileId,
                babyProfileId: query.babyProfileId,
                status: query.status,
            },
            include: includeAbnormality,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const abnormality = await this.prisma.careAbnormality.findUnique({ where: { id }, include: includeAbnormality });
        if (!abnormality)
            throw new common_1.NotFoundException(`CareAbnormality ${id} 不存在`);
        return abnormality;
    }
    getFollowUps(id) {
        return this.followUpService.findMany('CARE_ABNORMALITY', id);
    }
    async follow(id, dto) {
        const abnormality = await this.findOneOrThrow(id);
        if (!['OPEN', 'FOLLOWING'].includes(abnormality.status)) {
            throw new common_1.BadRequestException(`护理异常当前状态「${abnormality.status}」不允许添加跟进记录`);
        }
        const followUp = await this.followUpService.create({
            businessType: 'CARE_ABNORMALITY',
            businessId: id,
            type: dto.type,
            content: dto.content,
            nextFollowUpAt: dto.nextFollowUpAt,
        });
        if (abnormality.status === 'OPEN') {
            await this.prisma.careAbnormality.update({
                where: { id },
                data: { status: 'FOLLOWING', version: { increment: 1 } },
            });
        }
        return followUp;
    }
    async resolve(id, dto) {
        return this.transitionToTerminal(id, dto, 'RESOLVED');
    }
    async ignore(id, dto) {
        return this.transitionToTerminal(id, dto, 'IGNORED');
    }
    async transitionToTerminal(id, dto, target) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== dto.version) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        if (!['OPEN', 'FOLLOWING'].includes(before.status)) {
            throw new common_1.BadRequestException(`护理异常当前状态「${before.status}」不允许此操作`);
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.careAbnormality.update({
            where: { id, version: dto.version },
            data: {
                status: target,
                resolveNote: dto.resolveNote,
                resolvedBy: this.ctx.accountId,
                resolvedAt: new Date(),
                version: { increment: 1 },
            },
        }));
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'CareAbnormality',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: `${before.status} -> ${target}`,
            ...this.auditCtx(),
        });
        return updated;
    }
    auditCtx() {
        return {
            tenantId: this.ctx.tenantId,
            storeId: this.ctx.homeStoreId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        };
    }
};
exports.CareAbnormalityService = CareAbnormalityService;
exports.CareAbnormalityService = CareAbnormalityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        follow_up_service_1.FollowUpService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CareAbnormalityService);
//# sourceMappingURL=care-abnormality.service.js.map