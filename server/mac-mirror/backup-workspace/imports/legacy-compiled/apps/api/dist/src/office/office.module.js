"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfficeModule = void 0;
const common_1 = require("@nestjs/common");
const leave_request_module_1 = require("./leave-request/leave-request.module");
const expense_claim_module_1 = require("./expense-claim/expense-claim.module");
const general_memo_module_1 = require("./general-memo/general-memo.module");
let OfficeModule = class OfficeModule {
};
exports.OfficeModule = OfficeModule;
exports.OfficeModule = OfficeModule = __decorate([
    (0, common_1.Module)({
        imports: [leave_request_module_1.LeaveRequestModule, expense_claim_module_1.ExpenseClaimModule, general_memo_module_1.GeneralMemoModule],
    })
], OfficeModule);
//# sourceMappingURL=office.module.js.map