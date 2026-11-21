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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngineController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const request_context_service_1 = require("../../common/context/request-context.service");
const workflow_engine_service_1 = require("./workflow-engine.service");
const workflow_query_service_1 = require("./workflow-query.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const comment_dto_1 = require("./dto/comment.dto");
const reassign_dto_1 = require("./dto/reassign.dto");
const add_approver_dto_1 = require("./dto/add-approver.dto");
const cc_dto_1 = require("./dto/cc.dto");
const query_workflow_instance_dto_1 = require("./dto/query-workflow-instance.dto");
let WorkflowEngineController = class WorkflowEngineController {
    workflowEngineService;
    queryService;
    prisma;
    ctx;
    constructor(workflowEngineService, queryService, prisma, ctx) {
        this.workflowEngineService = workflowEngineService;
        this.queryService = queryService;
        this.prisma = prisma;
        this.ctx = ctx;
    }
    findByBusiness(query) {
        return this.prisma.workflowInstance.findFirst({
            where: { tenantId: this.ctx.tenantId, businessType: query.businessType, businessId: query.businessId },
            orderBy: { createdAt: 'desc' },
        });
    }
    approvals(tab = 'pending', keyword) {
        const t = ['pending', 'done', 'mine', 'cc'].find((x) => x === tab) ?? 'pending';
        return this.queryService.approvals(t, keyword);
    }
    async progressByBusiness(query) {
        const id = await this.queryService.instanceIdByBusiness(query.businessType, query.businessId);
        return id ? this.queryService.progress(id) : null;
    }
    progress(id) {
        return this.queryService.progress(id);
    }
    urge(id, dto) {
        return this.workflowEngineService.urge(id, this.actor(), dto.comment);
    }
    async findOne(id) {
        const instance = await this.prisma.workflowInstance.findUnique({
            where: { id },
            include: {
                approvers: { orderBy: [{ nodeSeq: 'asc' }, { createdAt: 'asc' }] },
                actions: { orderBy: { createdAt: 'asc' } },
            },
        });
        if (!instance)
            throw new common_1.NotFoundException(`WorkflowInstance ${id} 不存在`);
        return instance;
    }
    approve(id, dto) {
        return this.workflowEngineService.approve(id, this.actor(), dto.comment);
    }
    reject(id, dto) {
        return this.workflowEngineService.reject(id, this.actor(), dto.comment);
    }
    withdraw(id, dto) {
        return this.workflowEngineService.withdraw(id, this.actor(), dto.comment);
    }
    reassign(id, dto) {
        return this.ctx.hasPermission('workflow.definition.update').then((asAdmin) => this.workflowEngineService.reassign(id, dto.toAccountId, this.actor(), dto.comment, asAdmin));
    }
    addApprover(id, dto) {
        return this.workflowEngineService.addApprover(id, dto.accountId, this.actor(), dto.comment);
    }
    cc(id, dto) {
        return this.workflowEngineService.cc(id, dto.accountIds, this.actor());
    }
    archive(id) {
        return this.workflowEngineService.archive(id, this.actor());
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
exports.WorkflowEngineController = WorkflowEngineController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_workflow_instance_dto_1.QueryWorkflowInstanceDto]),
    __metadata("design:returntype", void 0)
], WorkflowEngineController.prototype, "findByBusiness", null);
__decorate([
    (0, common_1.Get)('approvals'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.view'),
    __param(0, (0, common_1.Query)('tab')),
    __param(1, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkflowEngineController.prototype, "approvals", null);
__decorate([
    (0, common_1.Get)('progress'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_workflow_instance_dto_1.QueryWorkflowInstanceDto]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "progressByBusiness", null);
__decorate([
    (0, common_1.Get)(':id/progress'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkflowEngineController.prototype, "progress", null);
__decorate([
    (0, common_1.Post)(':id/urge'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.view'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, comment_dto_1.CommentDto]),
    __metadata("design:returntype", void 0)
], WorkflowEngineController.prototype, "urge", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowEngineController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, comment_dto_1.CommentDto]),
    __metadata("design:returntype", void 0)
], WorkflowEngineController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, comment_dto_1.CommentDto]),
    __metadata("design:returntype", void 0)
], WorkflowEngineController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/withdraw'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.withdraw'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, comment_dto_1.CommentDto]),
    __metadata("design:returntype", void 0)
], WorkflowEngineController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Post)(':id/reassign'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.reassign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reassign_dto_1.ReassignDto]),
    __metadata("design:returntype", void 0)
], WorkflowEngineController.prototype, "reassign", null);
__decorate([
    (0, common_1.Post)(':id/add-approver'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.add-approver'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_approver_dto_1.AddApproverDto]),
    __metadata("design:returntype", void 0)
], WorkflowEngineController.prototype, "addApprover", null);
__decorate([
    (0, common_1.Post)(':id/cc'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.cc'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cc_dto_1.CcDto]),
    __metadata("design:returntype", void 0)
], WorkflowEngineController.prototype, "cc", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.archive'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkflowEngineController.prototype, "archive", null);
exports.WorkflowEngineController = WorkflowEngineController = __decorate([
    (0, swagger_1.ApiTags)('workflow/instance'),
    (0, common_1.Controller)('workflow/instances'),
    __metadata("design:paramtypes", [workflow_engine_service_1.WorkflowEngineService,
        workflow_query_service_1.WorkflowQueryService,
        prisma_service_1.PrismaService,
        request_context_service_1.RequestContextService])
], WorkflowEngineController);
//# sourceMappingURL=workflow-engine.controller.js.map