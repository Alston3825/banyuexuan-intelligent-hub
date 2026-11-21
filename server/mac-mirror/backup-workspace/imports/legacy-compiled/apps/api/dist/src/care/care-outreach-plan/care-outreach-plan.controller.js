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
exports.CareOutreachPlanController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_outreach_plan_service_1 = require("./care-outreach-plan.service");
const create_care_outreach_plan_dto_1 = require("./dto/create-care-outreach-plan.dto");
const query_care_outreach_plan_dto_1 = require("./dto/query-care-outreach-plan.dto");
const terminate_care_outreach_plan_dto_1 = require("./dto/terminate-care-outreach-plan.dto");
const complete_care_outreach_task_dto_1 = require("./dto/complete-care-outreach-task.dto");
let CareOutreachPlanController = class CareOutreachPlanController {
    careOutreachPlanService;
    constructor(careOutreachPlanService) {
        this.careOutreachPlanService = careOutreachPlanService;
    }
    findPendingTasks() {
        return this.careOutreachPlanService.findPendingTasks();
    }
    findAll(query) {
        return this.careOutreachPlanService.findMany(query);
    }
    findOne(id) {
        return this.careOutreachPlanService.findOneOrThrow(id);
    }
    create(dto) {
        return this.careOutreachPlanService.create(dto);
    }
    terminate(id, dto) {
        return this.careOutreachPlanService.terminate(id, dto.reason, dto.version);
    }
    completeTask(taskId, dto) {
        return this.careOutreachPlanService.completeTask(taskId, dto);
    }
};
exports.CareOutreachPlanController = CareOutreachPlanController;
__decorate([
    (0, common_1.Get)('pending-tasks'),
    (0, require_permission_decorator_1.RequirePermission)('care.outreach-plan.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CareOutreachPlanController.prototype, "findPendingTasks", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('care.outreach-plan.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_care_outreach_plan_dto_1.QueryCareOutreachPlanDto]),
    __metadata("design:returntype", void 0)
], CareOutreachPlanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.outreach-plan.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareOutreachPlanController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('care.outreach-plan.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_care_outreach_plan_dto_1.CreateCareOutreachPlanDto]),
    __metadata("design:returntype", void 0)
], CareOutreachPlanController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/terminate'),
    (0, require_permission_decorator_1.RequirePermission)('care.outreach-plan.terminate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, terminate_care_outreach_plan_dto_1.TerminateCareOutreachPlanDto]),
    __metadata("design:returntype", void 0)
], CareOutreachPlanController.prototype, "terminate", null);
__decorate([
    (0, common_1.Patch)('tasks/:taskId/complete'),
    (0, require_permission_decorator_1.RequirePermission)('care.outreach-plan.complete-task'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, complete_care_outreach_task_dto_1.CompleteCareOutreachTaskDto]),
    __metadata("design:returntype", void 0)
], CareOutreachPlanController.prototype, "completeTask", null);
exports.CareOutreachPlanController = CareOutreachPlanController = __decorate([
    (0, swagger_1.ApiTags)('care/outreach-plan'),
    (0, common_1.Controller)('care/outreach-plans'),
    __metadata("design:paramtypes", [care_outreach_plan_service_1.CareOutreachPlanService])
], CareOutreachPlanController);
//# sourceMappingURL=care-outreach-plan.controller.js.map