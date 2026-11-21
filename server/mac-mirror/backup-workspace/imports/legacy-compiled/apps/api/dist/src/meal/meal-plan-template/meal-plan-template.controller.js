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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealPlanTemplateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const meal_plan_template_service_1 = require("./meal-plan-template.service");
const create_meal_plan_template_dto_1 = require("./dto/create-meal-plan-template.dto");
const update_meal_plan_template_dto_1 = require("./dto/update-meal-plan-template.dto");
let MealPlanTemplateController = class MealPlanTemplateController {
    mealPlanTemplateService;
    constructor(mealPlanTemplateService) {
        this.mealPlanTemplateService = mealPlanTemplateService;
    }
    findAll() {
        return this.mealPlanTemplateService.findMany();
    }
    findOne(id) {
        return this.mealPlanTemplateService.findOneOrThrow(id);
    }
    create(dto) {
        return this.mealPlanTemplateService.create(dto);
    }
    update(id, dto) {
        return this.mealPlanTemplateService.update(id, dto);
    }
};
exports.MealPlanTemplateController = MealPlanTemplateController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('meal.plan-template.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MealPlanTemplateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('meal.plan-template.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MealPlanTemplateController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('meal.plan-template.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_meal_plan_template_dto_1.CreateMealPlanTemplateDto]),
    __metadata("design:returntype", void 0)
], MealPlanTemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('meal.plan-template.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_meal_plan_template_dto_1.UpdateMealPlanTemplateDto]),
    __metadata("design:returntype", void 0)
], MealPlanTemplateController.prototype, "update", null);
exports.MealPlanTemplateController = MealPlanTemplateController = __decorate([
    (0, swagger_1.ApiTags)('meal/plan-template'),
    (0, common_1.Controller)('meal/plan-templates'),
    __metadata("design:paramtypes", [meal_plan_template_service_1.MealPlanTemplateService])
], MealPlanTemplateController);
//# sourceMappingURL=meal-plan-template.controller.js.map