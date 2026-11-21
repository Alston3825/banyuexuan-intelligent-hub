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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareAssessmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_assessment_service_1 = require("./care-assessment.service");
class CreateAssessmentDto {
    profileId;
    documentId;
    values;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: '妈妈档案 id（产妇表）或宝宝档案 id（宝宝表）' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAssessmentDto.prototype, "profileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '对应的纸质原件资料 id' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssessmentDto.prototype, "documentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '表单字段值，key 见 GET specs' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], CreateAssessmentDto.prototype, "values", void 0);
class UpdateAssessmentDto {
    version;
    documentId;
    values;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateAssessmentDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateAssessmentDto.prototype, "documentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], UpdateAssessmentDto.prototype, "values", void 0);
let CareAssessmentController = class CareAssessmentController {
    service;
    constructor(service) {
        this.service = service;
    }
    specs() {
        return this.service.specs();
    }
    overview(motherProfileId) {
        return this.service.overview(motherProfileId);
    }
    create(type, dto) {
        return this.service.create(type, dto);
    }
    update(type, id, dto) {
        return this.service.update(type, id, dto);
    }
};
exports.CareAssessmentController = CareAssessmentController;
__decorate([
    (0, common_1.Get)('specs'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CareAssessmentController.prototype, "specs", null);
__decorate([
    (0, common_1.Get)('overview'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)('motherProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareAssessmentController.prototype, "overview", null);
__decorate([
    (0, common_1.Post)(':type'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.create'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateAssessmentDto]),
    __metadata("design:returntype", void 0)
], CareAssessmentController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':type/:id'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, UpdateAssessmentDto]),
    __metadata("design:returntype", void 0)
], CareAssessmentController.prototype, "update", null);
exports.CareAssessmentController = CareAssessmentController = __decorate([
    (0, swagger_1.ApiTags)('care/assessment'),
    (0, common_1.Controller)('care/assessments'),
    __metadata("design:paramtypes", [care_assessment_service_1.CareAssessmentService])
], CareAssessmentController);
//# sourceMappingURL=care-assessment.controller.js.map