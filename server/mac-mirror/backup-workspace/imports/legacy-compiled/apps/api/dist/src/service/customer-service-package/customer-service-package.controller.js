"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerServicePackageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const customer_service_package_service_1 = require("./customer-service-package.service");
const create_customer_service_package_dto_1 = require("./dto/create-customer-service-package.dto");
const query_customer_service_package_dto_1 = require("./dto/query-customer-service-package.dto");
const query_customer_service_package_report_dto_1 = require("./dto/query-customer-service-package-report.dto");
let CustomerServicePackageController = class CustomerServicePackageController {
    customerServicePackageService;
    constructor(customerServicePackageService) {
        this.customerServicePackageService = customerServicePackageService;
    }
    findAll(query) {
        return this.customerServicePackageService.findMany(query);
    }
    report(query) {
        return this.customerServicePackageService.report(query);
    }
    findOne(id) {
        return this.customerServicePackageService.findOneOrThrow(id);
    }
    create(dto) {
        return this.customerServicePackageService.create(dto);
    }
};
exports.CustomerServicePackageController = CustomerServicePackageController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('service.customer-package.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_customer_service_package_dto_1.QueryCustomerServicePackageDto]),
    __metadata("design:returntype", void 0)
], CustomerServicePackageController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('report'),
    (0, require_permission_decorator_1.RequirePermission)('service.customer-package.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_customer_service_package_report_dto_1.QueryCustomerServicePackageReportDto]),
    __metadata("design:returntype", void 0)
], CustomerServicePackageController.prototype, "report", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('service.customer-package.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerServicePackageController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('service.customer-package.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_service_package_dto_1.CreateCustomerServicePackageDto]),
    __metadata("design:returntype", void 0)
], CustomerServicePackageController.prototype, "create", null);
exports.CustomerServicePackageController = CustomerServicePackageController = __decorate([
    (0, swagger_1.ApiTags)('service/customer-package'),
    (0, common_1.Controller)('service/customer-packages'),
    __metadata("design:paramtypes", [customer_service_package_service_1.CustomerServicePackageService])
], CustomerServicePackageController);
//# sourceMappingURL=customer-service-package.controller.js.map