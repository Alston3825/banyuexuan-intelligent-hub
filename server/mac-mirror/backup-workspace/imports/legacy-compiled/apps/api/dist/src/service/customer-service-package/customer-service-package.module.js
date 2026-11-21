"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerServicePackageModule = void 0;
const common_1 = require("@nestjs/common");
const customer_service_package_controller_1 = require("./customer-service-package.controller");
const customer_service_package_service_1 = require("./customer-service-package.service");
let CustomerServicePackageModule = class CustomerServicePackageModule {
};
exports.CustomerServicePackageModule = CustomerServicePackageModule;
exports.CustomerServicePackageModule = CustomerServicePackageModule = __decorate([
    (0, common_1.Module)({
        controllers: [customer_service_package_controller_1.CustomerServicePackageController],
        providers: [customer_service_package_service_1.CustomerServicePackageService],
        exports: [customer_service_package_service_1.CustomerServicePackageService],
    })
], CustomerServicePackageModule);
//# sourceMappingURL=customer-service-package.module.js.map