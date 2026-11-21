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
exports.CreateMotherProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const baby_profile_input_dto_1 = require("./baby-profile-input.dto");
class CreateMotherProfileDto {
    customerId;
    occupancyId;
    deliveryMethod;
    deliveryDate;
    gestationalWeeks;
    expectedDeliveryDate;
    careNote;
    primaryNurseId;
    allergens;
    remark;
    riskTagIds;
    babies;
}
exports.CreateMotherProfileDto = CreateMotherProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMotherProfileDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '关联的入住记录（可为空，建档时未必已排房）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMotherProfileDto.prototype, "occupancyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.DeliveryMethod }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.DeliveryMethod),
    __metadata("design:type", typeof (_a = typeof client_1.DeliveryMethod !== "undefined" && client_1.DeliveryMethod) === "function" ? _a : Object)
], CreateMotherProfileDto.prototype, "deliveryMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMotherProfileDto.prototype, "deliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateMotherProfileDto.prototype, "gestationalWeeks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMotherProfileDto.prototype, "expectedDeliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '护理要点/医嘱：护理看板卡片上展示的简短提示' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMotherProfileDto.prototype, "careNote", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '主责护理师（员工账号 ID）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMotherProfileDto.prototype, "primaryNurseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '过敏源（产妇本人）；护理看板的过敏提示以它为准' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMotherProfileDto.prototype, "allergens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMotherProfileDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '风险标签 ID 列表（早产/传染病/高敏/妈咪住院等）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateMotherProfileDto.prototype, "riskTagIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [baby_profile_input_dto_1.BabyProfileInputDto], description: '随档同时建立的宝宝档案（多胞胎传多条）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => baby_profile_input_dto_1.BabyProfileInputDto),
    __metadata("design:type", Array)
], CreateMotherProfileDto.prototype, "babies", void 0);
//# sourceMappingURL=create-mother-profile.dto.js.map