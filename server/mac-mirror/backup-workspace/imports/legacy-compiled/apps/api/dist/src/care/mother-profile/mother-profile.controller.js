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
exports.MotherProfileController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const mother_profile_service_1 = require("./mother-profile.service");
const create_mother_profile_dto_1 = require("./dto/create-mother-profile.dto");
const update_mother_profile_dto_1 = require("./dto/update-mother-profile.dto");
const query_mother_profile_dto_1 = require("./dto/query-mother-profile.dto");
class SetRiskTagsDto {
    tagIds;
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SetRiskTagsDto.prototype, "tagIds", void 0);
let MotherProfileController = class MotherProfileController {
    motherProfileService;
    constructor(motherProfileService) {
        this.motherProfileService = motherProfileService;
    }
    findAll(query) {
        return this.motherProfileService.findMany(query);
    }
    formOptions() {
        return this.motherProfileService.formOptions();
    }
    nurseOptions(storeId) {
        return this.motherProfileService.nurseOptions(storeId);
    }
    findOne(id) {
        return this.motherProfileService.findOneOrThrow(id);
    }
    riskTags(id) {
        return this.motherProfileService.getRiskTags('MOTHER_PROFILE', id);
    }
    setRiskTags(id, dto) {
        return this.motherProfileService.setRiskTags(id, dto.tagIds);
    }
    create(dto) {
        return this.motherProfileService.create(dto);
    }
    update(id, dto) {
        return this.motherProfileService.update(id, dto);
    }
    deleteCheck(id) {
        return this.motherProfileService.getDeleteCheck(id);
    }
    remove(id, force, confirmName) {
        return this.motherProfileService.remove(id, force === 'true', confirmName);
    }
    archive(id) {
        return this.motherProfileService.archive(id);
    }
    restore(id) {
        return this.motherProfileService.restore(id);
    }
};
exports.MotherProfileController = MotherProfileController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_mother_profile_dto_1.QueryMotherProfileDto]),
    __metadata("design:returntype", void 0)
], MotherProfileController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('form-options'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MotherProfileController.prototype, "formOptions", null);
__decorate([
    (0, common_1.Get)('nurse-options'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MotherProfileController.prototype, "nurseOptions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MotherProfileController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/risk-tags'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MotherProfileController.prototype, "riskTags", null);
__decorate([
    (0, common_1.Put)(':id/risk-tags'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SetRiskTagsDto]),
    __metadata("design:returntype", void 0)
], MotherProfileController.prototype, "setRiskTags", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mother_profile_dto_1.CreateMotherProfileDto]),
    __metadata("design:returntype", void 0)
], MotherProfileController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_mother_profile_dto_1.UpdateMotherProfileDto]),
    __metadata("design:returntype", void 0)
], MotherProfileController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id/delete-check'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MotherProfileController.prototype, "deleteCheck", null);
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
], MotherProfileController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, common_1.HttpCode)(204),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MotherProfileController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.HttpCode)(204),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MotherProfileController.prototype, "restore", null);
exports.MotherProfileController = MotherProfileController = __decorate([
    (0, swagger_1.ApiTags)('care/mother-profile'),
    (0, common_1.Controller)('care/mother-profiles'),
    __metadata("design:paramtypes", [mother_profile_service_1.MotherProfileService])
], MotherProfileController);
//# sourceMappingURL=mother-profile.controller.js.map