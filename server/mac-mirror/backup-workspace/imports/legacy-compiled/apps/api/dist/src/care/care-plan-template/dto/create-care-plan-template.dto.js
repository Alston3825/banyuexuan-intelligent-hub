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
exports.CreateCarePlanTemplateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const care_plan_template_item_dto_1 = require("./care-plan-template-item.dto");
class CreateCarePlanTemplateDto {
    code;
    name;
    targetType;
    totalDays;
    items;
}
exports.CreateCarePlanTemplateDto = CreateCarePlanTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCarePlanTemplateDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCarePlanTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.CareTargetType }),
    (0, class_validator_1.IsEnum)(client_1.CareTargetType),
    __metadata("design:type", typeof (_a = typeof client_1.CareTargetType !== "undefined" && client_1.CareTargetType) === "function" ? _a : Object)
], CreateCarePlanTemplateDto.prototype, "targetType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCarePlanTemplateDto.prototype, "totalDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [care_plan_template_item_dto_1.CarePlanTemplateItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => care_plan_template_item_dto_1.CarePlanTemplateItemDto),
    __metadata("design:type", Array)
], CreateCarePlanTemplateDto.prototype, "items", void 0);
//# sourceMappingURL=create-care-plan-template.dto.js.map