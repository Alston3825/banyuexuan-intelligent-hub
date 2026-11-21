"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAccountModule = void 0;
const common_1 = require("@nestjs/common");
const customer_account_controller_1 = require("./customer-account.controller");
const customer_account_service_1 = require("./customer-account.service");
const customer_module_1 = require("../../crm/customer/customer.module");
let CustomerAccountModule = class CustomerAccountModule {
};
exports.CustomerAccountModule = CustomerAccountModule;
exports.CustomerAccountModule = CustomerAccountModule = __decorate([
    (0, common_1.Module)({
        imports: [customer_module_1.CustomerModule],
        controllers: [customer_account_controller_1.CustomerAccountController],
        providers: [customer_account_service_1.CustomerAccountService],
        exports: [customer_account_service_1.CustomerAccountService],
    })
], CustomerAccountModule);
//# sourceMappingURL=customer-account.module.js.map