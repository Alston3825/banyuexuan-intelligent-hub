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
exports.CreateMealPlanTemplateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const meal_plan_template_item_dto_1 = require("./meal-plan-template-item.dto");
class CreateMealPlanTemplateDto {
    code;
    name;
    planType;
    totalDays;
    phases;
    items;
}
exports.CreateMealPlanTemplateDto = CreateMealPlanTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMealPlanTemplateDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMealPlanTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.MealPlanType }),
    (0, class_validator_1.IsEnum)(client_1.MealPlanType),
    __metadata("design:type", typeof (_a = typeof client_1.MealPlanType !== "undefined" && client_1.MealPlanType) === "function" ? _a : Object)
], CreateMealPlanTemplateDto.prototype, "planType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateMealPlanTemplateDto.prototype, "totalDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '阶段化展示用，如 [{"name":"第1阶段","days":7}]' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateMealPlanTemplateDto.prototype, "phases", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [meal_plan_template_item_dto_1.MealPlanTemplateItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => meal_plan_template_item_dto_1.MealPlanTemplateItemDto),
    __metadata("design:type", Array)
], CreateMealPlanTemplateDto.prototype, "items", void 0);
//# sourceMappingURL=create-meal-plan-template.dto.js.map