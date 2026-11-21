"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractRecordModule = void 0;
const common_1 = require("@nestjs/common");
const contract_record_controller_1 = require("./contract-record.controller");
const contract_record_service_1 = require("./contract-record.service");
const customer_module_1 = require("../../crm/customer/customer.module");
const ai_gateway_module_1 = require("../../ai/ai-gateway/ai-gateway.module");
const contract_storage_service_1 = require("../contract-storage/contract-storage.service");
const contract_extraction_service_1 = require("../contract-extraction/contract-extraction.service");
let ContractRecordModule = class ContractRecordModule {
};
exports.ContractRecordModule = ContractRecordModule;
exports.ContractRecordModule = ContractRecordModule = __decorate([
    (0, common_1.Module)({
        imports: [customer_module_1.CustomerModule, ai_gateway_module_1.AiGatewayModule],
        controllers: [contract_record_controller_1.ContractRecordController],
        providers: [contract_record_service_1.ContractRecordService, contract_storage_service_1.ContractStorageService, contract_extraction_service_1.ContractExtractionService],
        exports: [contract_record_service_1.ContractRecordService],
    })
], ContractRecordModule);
//# sourceMappingURL=contract-record.module.js.map