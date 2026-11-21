"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionRecordModule = void 0;
const common_1 = require("@nestjs/common");
const workflow_engine_module_1 = require("../../workflow/workflow-engine/workflow-engine.module");
const commission_record_controller_1 = require("./commission-record.controller");
const commission_record_service_1 = require("./commission-record.service");
let CommissionRecordModule = class CommissionRecordModule {
};
exports.CommissionRecordModule = CommissionRecordModule;
exports.CommissionRecordModule = CommissionRecordModule = __decorate([
    (0, common_1.Module)({
        imports: [workflow_engine_module_1.WorkflowEngineModule],
        controllers: [commission_record_controller_1.CommissionRecordController],
        providers: [commission_record_service_1.CommissionRecordService],
        exports: [commission_record_service_1.CommissionRecordService],
    })
], CommissionRecordModule);
//# sourceMappingURL=commission-record.module.js.map