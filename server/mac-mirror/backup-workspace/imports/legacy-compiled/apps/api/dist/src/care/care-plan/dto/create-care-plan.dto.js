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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCarePlanDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCarePlanDto {
    planTemplateId;
    motherProfileId;
    babyProfileId;
    startDate;
}
exports.CreateCarePlanDto = CreateCarePlanDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCarePlanDto.prototype, "planTemplateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'motherProfileId/babyProfileId 二选一' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCarePlanDto.prototype, "motherProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCarePlanDto.prototype, "babyProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '方案第1天对应的日期，通常=入住日' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCarePlanDto.prototype, "startDate", void 0);
//# sourceMappingURL=create-care-plan.dto.js.map