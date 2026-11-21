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
exports.MealItemController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const meal_item_service_1 = require("./meal-item.service");
const create_meal_item_dto_1 = require("./dto/create-meal-item.dto");
const update_meal_item_dto_1 = require("./dto/update-meal-item.dto");
let MealItemController = class MealItemController {
    mealItemService;
    constructor(mealItemService) {
        this.mealItemService = mealItemService;
    }
    findAll() {
        return this.mealItemService.findMany();
    }
    findOne(id) {
        return this.mealItemService.findOneOrThrow(id);
    }
    create(dto) {
        return this.mealItemService.create(dto);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.mealItemService.update(id, data, version);
    }
};
exports.MealItemController = MealItemController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('meal.item.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MealItemController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('meal.item.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MealItemController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('meal.item.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_meal_item_dto_1.CreateMealItemDto]),
    __metadata("design:returntype", void 0)
], MealItemController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('meal.item.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_meal_item_dto_1.UpdateMealItemDto]),
    __metadata("design:returntype", void 0)
], MealItemController.prototype, "update", null);
exports.MealItemController = MealItemController = __decorate([
    (0, swagger_1.ApiTags)('meal/item'),
    (0, common_1.Controller)('meal/items'),
    __metadata("design:paramtypes", [meal_item_service_1.MealItemService])
], MealItemController);
//# sourceMappingURL=meal-item.controller.js.map