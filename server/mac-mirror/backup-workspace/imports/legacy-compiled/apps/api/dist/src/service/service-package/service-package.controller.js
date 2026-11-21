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
exports.ServicePackageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const service_package_service_1 = require("./service-package.service");
const create_service_package_dto_1 = require("./dto/create-service-package.dto");
const update_service_package_dto_1 = require("./dto/update-service-package.dto");
let ServicePackageController = class ServicePackageController {
    servicePackageService;
    constructor(servicePackageService) {
        this.servicePackageService = servicePackageService;
    }
    findAll() {
        return this.servicePackageService.findMany();
    }
    findOne(id) {
        return this.servicePackageService.findOneOrThrow(id);
    }
    create(dto) {
        return this.servicePackageService.create(dto);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.servicePackageService.update(id, data, version);
    }
};
exports.ServicePackageController = ServicePackageController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('service.package.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServicePackageController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('service.package.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServicePackageController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('service.package.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_package_dto_1.CreateServicePackageDto]),
    __metadata("design:returntype", void 0)
], ServicePackageController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('service.package.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_service_package_dto_1.UpdateServicePackageDto]),
    __metadata("design:returntype", void 0)
], ServicePackageController.prototype, "update", null);
exports.ServicePackageController = ServicePackageController = __decorate([
    (0, swagger_1.ApiTags)('service/package'),
    (0, common_1.Controller)('service/packages'),
    __metadata("design:paramtypes", [service_package_service_1.ServicePackageService])
], ServicePackageController);
//# sourceMappingURL=service-package.controller.js.map