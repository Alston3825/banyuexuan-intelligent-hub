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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDeviceTypeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class UpdateDeviceTypeDto {
    category;
    name;
    protocol;
    requiresCommandConfirmation;
    status;
    version;
}
exports.UpdateDeviceTypeDto = UpdateDeviceTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.DeviceCategory }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.DeviceCategory),
    __metadata("design:type", typeof (_a = typeof client_1.DeviceCategory !== "undefined" && client_1.DeviceCategory) === "function" ? _a : Object)
], UpdateDeviceTypeDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeviceTypeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeviceTypeDto.prototype, "protocol", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateDeviceTypeDto.prototype, "requiresCommandConfirmation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.CommonStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CommonStatus),
    __metadata("design:type", typeof (_b = typeof client_1.CommonStatus !== "undefined" && client_1.CommonStatus) === "function" ? _b : Object)
], UpdateDeviceTypeDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '乐观锁版本号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateDeviceTypeDto.prototype, "version", void 0);
//# sourceMappingURL=update-device-type.dto.js.map