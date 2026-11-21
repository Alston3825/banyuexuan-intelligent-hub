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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDeviceTypeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateDeviceTypeDto {
    category;
    name;
    protocol;
    requiresCommandConfirmation;
}
exports.CreateDeviceTypeDto = CreateDeviceTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.DeviceCategory }),
    (0, class_validator_1.IsEnum)(client_1.DeviceCategory),
    __metadata("design:type", typeof (_a = typeof client_1.DeviceCategory !== "undefined" && client_1.DeviceCategory) === "function" ? _a : Object)
], CreateDeviceTypeDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDeviceTypeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '接入协议，自由文本，如 "MQTT"/"RTSP/MQTT"/"串口转HTTP"' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDeviceTypeDto.prototype, "protocol", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '门禁/监控等敏感设备下发指令是否需要二次确认' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDeviceTypeDto.prototype, "requiresCommandConfirmation", void 0);
//# sourceMappingURL=create-device-type.dto.js.map