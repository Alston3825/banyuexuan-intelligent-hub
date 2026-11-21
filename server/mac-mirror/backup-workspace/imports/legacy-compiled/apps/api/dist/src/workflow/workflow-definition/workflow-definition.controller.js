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
exports.WorkflowDefinitionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const workflow_definition_service_1 = require("./workflow-definition.service");
let WorkflowDefinitionController = class WorkflowDefinitionController {
    workflowDefinitionService;
    constructor(workflowDefinitionService) {
        this.workflowDefinitionService = workflowDefinitionService;
    }
    findAll() {
        return this.workflowDefinitionService.findMany();
    }
    settings() {
        return this.workflowDefinitionService.listForSettings();
    }
    save(code, dto) {
        return this.workflowDefinitionService.save(code, dto);
    }
};
exports.WorkflowDefinitionController = WorkflowDefinitionController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('workflow.instance.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkflowDefinitionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.definition.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorkflowDefinitionController.prototype, "settings", null);
__decorate([
    (0, common_1.Put)(':code'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.definition.update'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workflow_definition_service_1.SaveWorkflowDefinitionDto]),
    __metadata("design:returntype", void 0)
], WorkflowDefinitionController.prototype, "save", null);
exports.WorkflowDefinitionController = WorkflowDefinitionController = __decorate([
    (0, swagger_1.ApiTags)('workflow/definition'),
    (0, common_1.Controller)('workflow/definitions'),
    __metadata("design:paramtypes", [workflow_definition_service_1.WorkflowDefinitionService])
], WorkflowDefinitionController);
//# sourceMappingURL=workflow-definition.controller.js.map