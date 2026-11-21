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
exports.ParameterController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const parameter_service_1 = require("./parameter.service");
const create_parameter_dto_1 = require("./dto/create-parameter.dto");
const update_parameter_dto_1 = require("./dto/update-parameter.dto");
let ParameterController = class ParameterController {
    parameterService;
    constructor(parameterService) {
        this.parameterService = parameterService;
    }
    findAll() {
        return this.parameterService.findMany();
    }
    findOne(id) {
        return this.parameterService.findOneOrThrow(id);
    }
    create(dto) {
        return this.parameterService.create(dto);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.parameterService.update(id, data, version);
    }
    remove(id) {
        return this.parameterService.delete(id);
    }
};
exports.ParameterController = ParameterController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('platform.parameter.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ParameterController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('platform.parameter.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParameterController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('platform.parameter.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_parameter_dto_1.CreateParameterDto]),
    __metadata("design:returntype", void 0)
], ParameterController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('platform.parameter.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_parameter_dto_1.UpdateParameterDto]),
    __metadata("design:returntype", void 0)
], ParameterController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('platform.parameter.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParameterController.prototype, "remove", null);
exports.ParameterController = ParameterController = __decorate([
    (0, swagger_1.ApiTags)('platform/parameter'),
    (0, common_1.Controller)('platform/parameters'),
    __metadata("design:paramtypes", [parameter_service_1.ParameterService])
], ParameterController);
//# sourceMappingURL=parameter.controller.js.map