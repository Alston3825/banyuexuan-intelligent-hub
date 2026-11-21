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
exports.DemoApprovalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const workflow_engine_service_1 = require("../workflow-engine/workflow-engine.service");
const BUSINESS_TYPE = 'DEMO_APPROVAL';
const DEFINITION_CODE = 'DEMO_APPROVAL';
let DemoApprovalService = class DemoApprovalService {
    prisma;
    workflowEngineService;
    ctx;
    constructor(prisma, workflowEngineService, ctx) {
        this.prisma = prisma;
        this.workflowEngineService = workflowEngineService;
        this.ctx = ctx;
    }
    findMany() {
        return this.prisma.demoApprovalRequest.findMany({ where: { tenantId: this.ctx.tenantId } });
    }
    async findOneOrThrow(id) {
        const request = await this.prisma.demoApprovalRequest.findUnique({ where: { id } });
        if (!request)
            throw new common_1.NotFoundException(`DemoApprovalRequest ${id} 不存在`);
        return request;
    }
    async create(data) {
        return this.prisma.demoApprovalRequest.create({
            data: {
                ...data,
                tenantId: this.ctx.tenantId,
                storeId: this.ctx.homeStoreId,
                applicantId: this.ctx.accountId,
                createdBy: this.ctx.accountId,
            },
        });
    }
    async submit(id) {
        const request = await this.findOneOrThrow(id);
        if (request.status !== 'DRAFT') {
            throw new common_1.ConflictException('该示例审批单已提交过，不可重复提交');
        }
        const instance = await this.workflowEngineService.startInstance({
            definitionCode: DEFINITION_CODE,
            businessType: BUSINESS_TYPE,
            businessId: id,
            title: request.title,
            storeId: request.storeId,
        }, this.actor());
        await this.prisma.demoApprovalRequest.update({
            where: { id },
            data: { status: instance.status, version: { increment: 1 } },
        });
        return instance;
    }
    actor() {
        return {
            accountId: this.ctx.accountId,
            tenantId: this.ctx.tenantId,
            storeId: this.ctx.homeStoreId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        };
    }
};
exports.DemoApprovalService = DemoApprovalService;
exports.DemoApprovalService = DemoApprovalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_engine_service_1.WorkflowEngineService,
        request_context_service_1.RequestContextService])
], DemoApprovalService);
//# sourceMappingURL=demo-approval.service.js.map