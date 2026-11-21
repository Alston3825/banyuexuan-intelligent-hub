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
exports.BabyProfileController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const baby_profile_service_1 = require("./baby-profile.service");
const create_baby_profile_dto_1 = require("./dto/create-baby-profile.dto");
const update_baby_profile_dto_1 = require("./dto/update-baby-profile.dto");
const query_baby_profile_dto_1 = require("./dto/query-baby-profile.dto");
class SetBabyRiskTagsDto {
    tagIds;
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SetBabyRiskTagsDto.prototype, "tagIds", void 0);
let BabyProfileController = class BabyProfileController {
    babyProfileService;
    constructor(babyProfileService) {
        this.babyProfileService = babyProfileService;
    }
    findAll(query) {
        return this.babyProfileService.findMany(query);
    }
    findOne(id) {
        return this.babyProfileService.findOneOrThrow(id);
    }
    riskTags(id) {
        return this.babyProfileService.getRiskTags(id);
    }
    setRiskTags(id, dto) {
        return this.babyProfileService.setRiskTags(id, dto.tagIds);
    }
    create(dto) {
        return this.babyProfileService.create(dto);
    }
    update(id, dto) {
        return this.babyProfileService.update(id, dto);
    }
    deleteCheck(id) {
        return this.babyProfileService.getDeleteCheck(id);
    }
    remove(id, force, confirmName) {
        return this.babyProfileService.remove(id, force === 'true', confirmName);
    }
};
exports.BabyProfileController = BabyProfileController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_baby_profile_dto_1.QueryBabyProfileDto]),
    __metadata("design:returntype", void 0)
], BabyProfileController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BabyProfileController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/risk-tags'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BabyProfileController.prototype, "riskTags", null);
__decorate([
    (0, common_1.Put)(':id/risk-tags'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SetBabyRiskTagsDto]),
    __metadata("design:returntype", void 0)
], BabyProfileController.prototype, "setRiskTags", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_baby_profile_dto_1.CreateBabyProfileDto]),
    __metadata("design:returntype", void 0)
], BabyProfileController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_baby_profile_dto_1.UpdateBabyProfileDto]),
    __metadata("design:returntype", void 0)
], BabyProfileController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id/delete-check'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BabyProfileController.prototype, "deleteCheck", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('force')),
    __param(2, (0, common_1.Query)('confirmName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], BabyProfileController.prototype, "remove", null);
exports.BabyProfileController = BabyProfileController = __decorate([
    (0, swagger_1.ApiTags)('care/baby-profile'),
    (0, common_1.Controller)('care/baby-profiles'),
    __metadata("design:paramtypes", [baby_profile_service_1.BabyProfileService])
], BabyProfileController);
//# sourceMappingURL=baby-profile.controller.js.map