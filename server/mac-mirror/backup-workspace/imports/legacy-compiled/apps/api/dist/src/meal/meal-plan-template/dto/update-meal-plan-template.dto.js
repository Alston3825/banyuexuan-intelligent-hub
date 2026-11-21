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
exports.UpdateMealPlanTemplateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const meal_plan_template_item_dto_1 = require("./meal-plan-template-item.dto");
class UpdateMealPlanTemplateDto {
    name;
    status;
    items;
    version;
}
exports.UpdateMealPlanTemplateDto = UpdateMealPlanTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMealPlanTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['ACTIVE', 'INACTIVE'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ACTIVE', 'INACTIVE']),
    __metadata("design:type", String)
], UpdateMealPlanTemplateDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [meal_plan_template_item_dto_1.MealPlanTemplateItemDto], description: '不传则不改排期；传了则整体替换' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => meal_plan_template_item_dto_1.MealPlanTemplateItemDto),
    __metadata("design:type", Array)
], UpdateMealPlanTemplateDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '乐观锁版本号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateMealPlanTemplateDto.prototype, "version", void 0);
//# sourceMappingURL=update-meal-plan-template.dto.js.map