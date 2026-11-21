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
exports.DeviceTypeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const device_type_service_1 = require("./device-type.service");
const create_device_type_dto_1 = require("./dto/create-device-type.dto");
const update_device_type_dto_1 = require("./dto/update-device-type.dto");
let DeviceTypeController = class DeviceTypeController {
    deviceTypeService;
    constructor(deviceTypeService) {
        this.deviceTypeService = deviceTypeService;
    }
    findAll() {
        return this.deviceTypeService.findMany();
    }
    findOne(id) {
        return this.deviceTypeService.findOneOrThrow(id);
    }
    create(dto) {
        return this.deviceTypeService.create(dto);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.deviceTypeService.update(id, data, version);
    }
};
exports.DeviceTypeController = DeviceTypeController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('iot.device-type.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DeviceTypeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('iot.device-type.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeviceTypeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('iot.device-type.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_device_type_dto_1.CreateDeviceTypeDto]),
    __metadata("design:returntype", void 0)
], DeviceTypeController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('iot.device-type.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_device_type_dto_1.UpdateDeviceTypeDto]),
    __metadata("design:returntype", void 0)
], DeviceTypeController.prototype, "update", null);
exports.DeviceTypeController = DeviceTypeController = __decorate([
    (0, swagger_1.ApiTags)('iot/device-type'),
    (0, common_1.Controller)('iot/device-types'),
    __metadata("design:paramtypes", [device_type_service_1.DeviceTypeService])
], DeviceTypeController);
//# sourceMappingURL=device-type.controller.js.map