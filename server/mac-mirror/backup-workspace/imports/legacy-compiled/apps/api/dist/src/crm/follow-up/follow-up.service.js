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
exports.FollowUpService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const lead_service_1 = require("../lead/lead.service");
let FollowUpService = class FollowUpService {
    prisma;
    leadService;
    auditLogService;
    ctx;
    constructor(prisma, leadService, auditLogService, ctx) {
        this.prisma = prisma;
        this.leadService = leadService;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany(businessType, businessId) {
        return this.prisma.followUpRecord.findMany({
            where: { tenantId: this.ctx.tenantId, businessType, businessId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data) {
        if (data.businessType === 'LEAD') {
            const lead = await this.leadService.findOneOrThrow(data.businessId);
            if (!['ASSIGNED', 'FOLLOWING'].includes(lead.status)) {
                throw new common_1.BadRequestException(`线索当前状态「${lead.status}」不允许添加跟进记录`);
            }
            await this.leadService.markFollowing(data.businessId);
        }
        const created = await this.prisma.followUpRecord.create({
            data: {
                businessType: data.businessType,
                businessId: data.businessId,
                type: data.type,
                content: data.content,
                nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : undefined,
                tenantId: this.ctx.tenantId,
                createdBy: this.ctx.accountId,
            },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'FollowUpRecord',
            entityId: created.id,
            afterData: created,
            tenantId: this.ctx.tenantId,
            storeId: this.ctx.homeStoreId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return created;
    }
};
exports.FollowUpService = FollowUpService;
exports.FollowUpService = FollowUpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        lead_service_1.LeadService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], FollowUpService);
//# sourceMappingURL=follow-up.service.js.map