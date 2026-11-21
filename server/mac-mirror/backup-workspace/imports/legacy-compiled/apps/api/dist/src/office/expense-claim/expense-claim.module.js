"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseClaimModule = void 0;
const common_1 = require("@nestjs/common");
const workflow_engine_module_1 = require("../../workflow/workflow-engine/workflow-engine.module");
const expense_claim_controller_1 = require("./expense-claim.controller");
const expense_claim_service_1 = require("./expense-claim.service");
let ExpenseClaimModule = class ExpenseClaimModule {
};
exports.ExpenseClaimModule = ExpenseClaimModule;
exports.ExpenseClaimModule = ExpenseClaimModule = __decorate([
    (0, common_1.Module)({
        imports: [workflow_engine_module_1.WorkflowEngineModule],
        controllers: [expense_claim_controller_1.ExpenseClaimController],
        providers: [expense_claim_service_1.ExpenseClaimService],
        exports: [expense_claim_service_1.ExpenseClaimService],
    })
], ExpenseClaimModule);
//# sourceMappingURL=expense-claim.module.js.map