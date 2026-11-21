"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealModule = void 0;
const common_1 = require("@nestjs/common");
const meal_item_module_1 = require("./meal-item/meal-item.module");
const dietary_restriction_module_1 = require("./dietary-restriction/dietary-restriction.module");
const meal_plan_template_module_1 = require("./meal-plan-template/meal-plan-template.module");
const diner_profile_module_1 = require("./diner-profile/diner-profile.module");
const meal_record_module_1 = require("./meal-record/meal-record.module");
let MealModule = class MealModule {
};
exports.MealModule = MealModule;
exports.MealModule = MealModule = __decorate([
    (0, common_1.Module)({
        imports: [meal_item_module_1.MealItemModule, dietary_restriction_module_1.DietaryRestrictionModule, meal_plan_template_module_1.MealPlanTemplateModule, diner_profile_module_1.DinerProfileModule, meal_record_module_1.MealRecordModule],
    })
], MealModule);
//# sourceMappingURL=meal.module.js.map