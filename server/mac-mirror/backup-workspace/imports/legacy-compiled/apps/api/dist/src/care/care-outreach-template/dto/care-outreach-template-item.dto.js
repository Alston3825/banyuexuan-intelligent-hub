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
exports.CareOutreachTemplateItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CareOutreachTemplateItemDto {
    dayOffset;
    title;
    content;
}
exports.CareOutreachTemplateItemDto = CareOutreachTemplateItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '离店日之后第几天，0=离店当天' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CareOutreachTemplateItemDto.prototype, "dayOffset", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CareOutreachTemplateItemDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '提醒要点/话术，自由文本，由用户/护理团队自行填写' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CareOutreachTemplateItemDto.prototype, "content", void 0);
//# sourceMappingURL=care-outreach-template-item.dto.js.map