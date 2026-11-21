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
exports.DietaryRestrictionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const dietary_restriction_service_1 = require("./dietary-restriction.service");
const create_dietary_restriction_dto_1 = require("./dto/create-dietary-restriction.dto");
const update_dietary_restriction_dto_1 = require("./dto/update-dietary-restriction.dto");
let DietaryRestrictionController = class DietaryRestrictionController {
    dietaryRestrictionService;
    constructor(dietaryRestrictionService) {
        this.dietaryRestrictionService = dietaryRestrictionService;
    }
    findAll() {
        return this.dietaryRestrictionService.findMany();
    }
    findOne(id) {
        return this.dietaryRestrictionService.findOneOrThrow(id);
    }
    create(dto) {
        return this.dietaryRestrictionService.create(dto);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.dietaryRestrictionService.update(id, data, version);
    }
};
exports.DietaryRestrictionController = DietaryRestrictionController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('meal.dietary-restriction.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DietaryRestrictionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('meal.dietary-restriction.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DietaryRestrictionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('meal.dietary-restriction.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_dietary_restriction_dto_1.CreateDietaryRestrictionDto]),
    __metadata("design:returntype", void 0)
], DietaryRestrictionController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('meal.dietary-restriction.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_dietary_restriction_dto_1.UpdateDietaryRestrictionDto]),
    __metadata("design:returntype", void 0)
], DietaryRestrictionController.prototype, "update", null);
exports.DietaryRestrictionController = DietaryRestrictionController = __decorate([
    (0, swagger_1.ApiTags)('meal/dietary-restriction'),
    (0, common_1.Controller)('meal/dietary-restrictions'),
    __metadata("design:paramtypes", [dietary_restriction_service_1.DietaryRestrictionService])
], DietaryRestrictionController);
//# sourceMappingURL=dietary-restriction.controller.js.map