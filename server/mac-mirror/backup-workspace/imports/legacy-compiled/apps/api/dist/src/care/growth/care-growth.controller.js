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
exports.PublicGrowthController = exports.CareGrowthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_growth_service_1 = require("./care-growth.service");
class GrowthRecordDto {
    babyProfileId;
    measuredAt;
    weightG;
    lengthCm;
    headCm;
    note;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GrowthRecordDto.prototype, "babyProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '测量日期 YYYY-MM-DD' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GrowthRecordDto.prototype, "measuredAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '不传=不改这一项；传 null=清掉手工修改值（恢复为系统数据）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Object)
], GrowthRecordDto.prototype, "weightG", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Object)
], GrowthRecordDto.prototype, "lengthCm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Object)
], GrowthRecordDto.prototype, "headCm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], GrowthRecordDto.prototype, "note", void 0);
let CareGrowthController = class CareGrowthController {
    service;
    constructor(service) {
        this.service = service;
    }
    report(babyId, standard) {
        return this.service.report(babyId, standard);
    }
    addRecord(dto) {
        return this.service.addRecord(dto);
    }
    removeRecord(id) {
        return this.service.removeRecord(id);
    }
    share(babyId) {
        return this.service.createShare(babyId);
    }
    revoke(babyId) {
        return this.service.revokeShares(babyId);
    }
};
exports.CareGrowthController = CareGrowthController;
__decorate([
    (0, common_1.Get)('baby/:babyId'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Param)('babyId')),
    __param(1, (0, common_1.Query)('standard')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CareGrowthController.prototype, "report", null);
__decorate([
    (0, common_1.Post)('records'),
    (0, require_permission_decorator_1.RequirePermission)('care.growth.edit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GrowthRecordDto]),
    __metadata("design:returntype", void 0)
], CareGrowthController.prototype, "addRecord", null);
__decorate([
    (0, common_1.Delete)('records/:id'),
    (0, common_1.HttpCode)(204),
    (0, require_permission_decorator_1.RequirePermission)('care.growth.edit'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareGrowthController.prototype, "removeRecord", null);
__decorate([
    (0, common_1.Post)('baby/:babyId/share'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('babyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareGrowthController.prototype, "share", null);
__decorate([
    (0, common_1.Post)('baby/:babyId/share/revoke'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('babyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareGrowthController.prototype, "revoke", null);
exports.CareGrowthController = CareGrowthController = __decorate([
    (0, swagger_1.ApiTags)('care/growth'),
    (0, common_1.Controller)('care/growth'),
    __metadata("design:paramtypes", [care_growth_service_1.CareGrowthService])
], CareGrowthController);
let PublicGrowthController = class PublicGrowthController {
    service;
    constructor(service) {
        this.service = service;
    }
    report(token, standard) {
        return this.service.publicReport(token, standard);
    }
};
exports.PublicGrowthController = PublicGrowthController;
__decorate([
    (0, common_1.Get)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Query)('standard')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicGrowthController.prototype, "report", null);
exports.PublicGrowthController = PublicGrowthController = __decorate([
    (0, swagger_1.ApiTags)('public/growth'),
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('public/growth'),
    __metadata("design:paramtypes", [care_growth_service_1.CareGrowthService])
], PublicGrowthController);
//# sourceMappingURL=care-growth.controller.js.map