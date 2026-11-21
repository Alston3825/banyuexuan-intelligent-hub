"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceModule = void 0;
const common_1 = require("@nestjs/common");
const service_product_module_1 = require("./service-product/service-product.module");
const service_package_module_1 = require("./service-package/service-package.module");
const therapist_module_1 = require("./therapist/therapist.module");
const customer_service_package_module_1 = require("./customer-service-package/customer-service-package.module");
const service_appointment_module_1 = require("./service-appointment/service-appointment.module");
let ServiceModule = class ServiceModule {
};
exports.ServiceModule = ServiceModule;
exports.ServiceModule = ServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [service_product_module_1.ServiceProductModule, service_package_module_1.ServicePackageModule, therapist_module_1.TherapistModule, customer_service_package_module_1.CustomerServicePackageModule, service_appointment_module_1.ServiceAppointmentModule],
    })
], ServiceModule);
//# sourceMappingURL=service.module.js.map