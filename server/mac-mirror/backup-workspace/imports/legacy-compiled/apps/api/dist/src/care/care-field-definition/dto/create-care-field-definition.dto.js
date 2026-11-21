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
exports.CreateCareFieldDefinitionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateCareFieldDefinitionDto {
    code;
    name;
    targetType;
    controlType;
    unit;
    options;
    normalMin;
    normalMax;
    normalOptionValues;
    visibleToClient;
}
exports.CreateCareFieldDefinitionDto = CreateCareFieldDefinitionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCareFieldDefinitionDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCareFieldDefinitionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.CareTargetType }),
    (0, class_validator_1.IsEnum)(client_1.CareTargetType),
    __metadata("design:type", typeof (_a = typeof client_1.CareTargetType !== "undefined" && client_1.CareTargetType) === "function" ? _a : Object)
], CreateCareFieldDefinitionDto.prototype, "targetType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.CareFieldControlType }),
    (0, class_validator_1.IsEnum)(client_1.CareFieldControlType),
    __metadata("design:type", typeof (_b = typeof client_1.CareFieldControlType !== "undefined" && client_1.CareFieldControlType) === "function" ? _b : Object)
], CreateCareFieldDefinitionDto.prototype, "controlType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCareFieldDefinitionDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'SELECT/RADIO 候选项：[{value,label}]' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateCareFieldDefinitionDto.prototype, "options", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '数值型字段的正常值下限' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCareFieldDefinitionDto.prototype, "normalMin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '数值型字段的正常值上限' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCareFieldDefinitionDto.prototype, "normalMax", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '选项型字段的正常值集合（选项 value 数组）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateCareFieldDefinitionDto.prototype, "normalOptionValues", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCareFieldDefinitionDto.prototype, "visibleToClient", void 0);
//# sourceMappingURL=create-care-field-definition.dto.js.map