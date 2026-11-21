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
exports.CreateCareRecordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCareRecordDto {
    formTemplateId;
    motherProfileId;
    babyProfileId;
    occurredAt;
    values;
    carePlanTaskId;
    isBackfilled;
    backfillReason;
    correctionOfId;
}
exports.CreateCareRecordDto = CreateCareRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCareRecordDto.prototype, "formTemplateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'motherProfileId/babyProfileId 二选一' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCareRecordDto.prototype, "motherProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCareRecordDto.prototype, "babyProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '护理行为实际发生时间' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCareRecordDto.prototype, "occurredAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '{fieldCode: value}' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], CreateCareRecordDto.prototype, "values", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '关联的每日任务卡片（提交后自动置为已完成）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCareRecordDto.prototype, "carePlanTaskId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: false, description: '是否为补录（当天遗漏事后补记）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCareRecordDto.prototype, "isBackfilled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'isBackfilled=true 时必填' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCareRecordDto.prototype, "backfillReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '若为对某条已提交记录的更正，填被更正记录的 ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCareRecordDto.prototype, "correctionOfId", void 0);
//# sourceMappingURL=create-care-record.dto.js.map