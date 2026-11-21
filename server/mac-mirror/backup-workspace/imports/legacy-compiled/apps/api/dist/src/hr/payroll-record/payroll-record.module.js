"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollRecordModule = void 0;
const common_1 = require("@nestjs/common");
const workflow_engine_module_1 = require("../../workflow/workflow-engine/workflow-engine.module");
const payroll_record_controller_1 = require("./payroll-record.controller");
const payroll_record_service_1 = require("./payroll-record.service");
let PayrollRecordModule = class PayrollRecordModule {
};
exports.PayrollRecordModule = PayrollRecordModule;
exports.PayrollRecordModule = PayrollRecordModule = __decorate([
    (0, common_1.Module)({
        imports: [workflow_engine_module_1.WorkflowEngineModule],
        controllers: [payroll_record_controller_1.PayrollRecordController],
        providers: [payroll_record_service_1.PayrollRecordService],
        exports: [payroll_record_service_1.PayrollRecordService],
    })
], PayrollRecordModule);
//# sourceMappingURL=payroll-record.module.js.map