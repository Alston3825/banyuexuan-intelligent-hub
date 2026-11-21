"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRecordModule = void 0;
const common_1 = require("@nestjs/common");
const payment_record_controller_1 = require("./payment-record.controller");
const payment_record_service_1 = require("./payment-record.service");
const customer_module_1 = require("../../crm/customer/customer.module");
const contract_record_module_1 = require("../../contract/contract-record/contract-record.module");
const workflow_engine_module_1 = require("../../workflow/workflow-engine/workflow-engine.module");
let PaymentRecordModule = class PaymentRecordModule {
};
exports.PaymentRecordModule = PaymentRecordModule;
exports.PaymentRecordModule = PaymentRecordModule = __decorate([
    (0, common_1.Module)({
        imports: [customer_module_1.CustomerModule, contract_record_module_1.ContractRecordModule, workflow_engine_module_1.WorkflowEngineModule],
        controllers: [payment_record_controller_1.PaymentRecordController],
        providers: [payment_record_service_1.PaymentRecordService],
        exports: [payment_record_service_1.PaymentRecordService],
    })
], PaymentRecordModule);
//# sourceMappingURL=payment-record.module.js.map