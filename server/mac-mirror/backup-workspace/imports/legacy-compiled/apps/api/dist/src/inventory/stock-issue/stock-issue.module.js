"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockIssueModule = void 0;
const common_1 = require("@nestjs/common");
const workflow_engine_module_1 = require("../../workflow/workflow-engine/workflow-engine.module");
const stock_issue_controller_1 = require("./stock-issue.controller");
const stock_issue_service_1 = require("./stock-issue.service");
let StockIssueModule = class StockIssueModule {
};
exports.StockIssueModule = StockIssueModule;
exports.StockIssueModule = StockIssueModule = __decorate([
    (0, common_1.Module)({
        imports: [workflow_engine_module_1.WorkflowEngineModule],
        controllers: [stock_issue_controller_1.StockIssueController],
        providers: [stock_issue_service_1.StockIssueService],
        exports: [stock_issue_service_1.StockIssueService],
    })
], StockIssueModule);
//# sourceMappingURL=stock-issue.module.js.map