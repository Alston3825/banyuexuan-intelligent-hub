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
exports.UpdateMotherProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class UpdateMotherProfileDto {
    occupancyId;
    deliveryMethod;
    deliveryDate;
    gestationalWeeks;
    expectedDeliveryDate;
    careNote;
    primaryNurseId;
    allergens;
    remark;
    version;
}
exports.UpdateMotherProfileDto = UpdateMotherProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMotherProfileDto.prototype, "occupancyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.DeliveryMethod }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.DeliveryMethod),
    __metadata("design:type", typeof (_a = typeof client_1.DeliveryMethod !== "undefined" && client_1.DeliveryMethod) === "function" ? _a : Object)
], UpdateMotherProfileDto.prototype, "deliveryMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateMotherProfileDto.prototype, "deliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateMotherProfileDto.prototype, "gestationalWeeks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateMotherProfileDto.prototype, "expectedDeliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '护理要点/医嘱：护理看板卡片上展示的简短提示' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMotherProfileDto.prototype, "careNote", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, nullable: true, description: '主责护理师（员工账号 ID）；传 null 表示清除' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateMotherProfileDto.prototype, "primaryNurseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '过敏源（产妇本人）；护理看板的过敏提示以它为准' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMotherProfileDto.prototype, "allergens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMotherProfileDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '乐观锁版本号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateMotherProfileDto.prototype, "version", void 0);
//# sourceMappingURL=update-mother-profile.dto.js.map