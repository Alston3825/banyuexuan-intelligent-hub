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
exports.BabyProfileInputDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class BabyProfileInputDto {
    name;
    gender;
    birthDate;
    birthWeightGrams;
    apgarScore;
    allergens;
    remark;
    riskTagIds;
}
exports.BabyProfileInputDto = BabyProfileInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BabyProfileInputDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.BabyGender }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.BabyGender),
    __metadata("design:type", typeof (_a = typeof client_1.BabyGender !== "undefined" && client_1.BabyGender) === "function" ? _a : Object)
], BabyProfileInputDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BabyProfileInputDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], BabyProfileInputDto.prototype, "birthWeightGrams", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BabyProfileInputDto.prototype, "apgarScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '宝宝过敏源' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BabyProfileInputDto.prototype, "allergens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BabyProfileInputDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '风险标签 ID 列表（早产/宝宝住院/宝宝托管等）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BabyProfileInputDto.prototype, "riskTagIds", void 0);
//# sourceMappingURL=baby-profile-input.dto.js.map