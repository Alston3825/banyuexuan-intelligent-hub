"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowDefinitionModule = void 0;
const common_1 = require("@nestjs/common");
const workflow_definition_controller_1 = require("./workflow-definition.controller");
const workflow_definition_service_1 = require("./workflow-definition.service");
let WorkflowDefinitionModule = class WorkflowDefinitionModule {
};
exports.WorkflowDefinitionModule = WorkflowDefinitionModule;
exports.WorkflowDefinitionModule = WorkflowDefinitionModule = __decorate([
    (0, common_1.Module)({
        controllers: [workflow_definition_controller_1.WorkflowDefinitionController],
        providers: [workflow_definition_service_1.WorkflowDefinitionService],
        exports: [workflow_definition_service_1.WorkflowDefinitionService],
    })
], WorkflowDefinitionModule);
//# sourceMappingURL=workflow-definition.module.js.map