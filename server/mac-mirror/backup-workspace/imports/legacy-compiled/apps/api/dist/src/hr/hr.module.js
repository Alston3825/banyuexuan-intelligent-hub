"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrModule = void 0;
const common_1 = require("@nestjs/common");
const employee_profile_module_1 = require("./employee-profile/employee-profile.module");
const shift_definition_module_1 = require("./shift-definition/shift-definition.module");
const schedule_entry_module_1 = require("./schedule-entry/schedule-entry.module");
const commission_record_module_1 = require("./commission-record/commission-record.module");
const payroll_record_module_1 = require("./payroll-record/payroll-record.module");
let HrModule = class HrModule {
};
exports.HrModule = HrModule;
exports.HrModule = HrModule = __decorate([
    (0, common_1.Module)({
        imports: [employee_profile_module_1.EmployeeProfileModule, shift_definition_module_1.ShiftDefinitionModule, schedule_entry_module_1.ScheduleEntryModule, commission_record_module_1.CommissionRecordModule, payroll_record_module_1.PayrollRecordModule],
    })
], HrModule);
//# sourceMappingURL=hr.module.js.map