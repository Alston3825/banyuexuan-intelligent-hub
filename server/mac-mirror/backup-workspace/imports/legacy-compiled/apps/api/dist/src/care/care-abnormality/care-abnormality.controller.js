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
exports.CareAbnormalityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_abnormality_service_1 = require("./care-abnormality.service");
const query_care_abnormality_dto_1 = require("./dto/query-care-abnormality.dto");
const follow_up_care_abnormality_dto_1 = require("./dto/follow-up-care-abnormality.dto");
const resolve_care_abnormality_dto_1 = require("./dto/resolve-care-abnormality.dto");
let CareAbnormalityController = class CareAbnormalityController {
    careAbnormalityService;
    constructor(careAbnormalityService) {
        this.careAbnormalityService = careAbnormalityService;
    }
    findAll(query) {
        return this.careAbnormalityService.findMany(query);
    }
    findOne(id) {
        return this.careAbnormalityService.findOneOrThrow(id);
    }
    followUps(id) {
        return this.careAbnormalityService.getFollowUps(id);
    }
    follow(id, dto) {
        return this.careAbnormalityService.follow(id, dto);
    }
    resolve(id, dto) {
        return this.careAbnormalityService.resolve(id, dto);
    }
    ignore(id, dto) {
        return this.careAbnormalityService.ignore(id, dto);
    }
};
exports.CareAbnormalityController = CareAbnormalityController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('care.abnormality.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_care_abnormality_dto_1.QueryCareAbnormalityDto]),
    __metadata("design:returntype", void 0)
], CareAbnormalityController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.abnormality.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareAbnormalityController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/follow-ups'),
    (0, require_permission_decorator_1.RequirePermission)('care.abnormality.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareAbnormalityController.prototype, "followUps", null);
__decorate([
    (0, common_1.Post)(':id/follow-ups'),
    (0, require_permission_decorator_1.RequirePermission)('care.abnormality.follow-up'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, follow_up_care_abnormality_dto_1.FollowUpCareAbnormalityDto]),
    __metadata("design:returntype", void 0)
], CareAbnormalityController.prototype, "follow", null);
__decorate([
    (0, common_1.Post)(':id/resolve'),
    (0, require_permission_decorator_1.RequirePermission)('care.abnormality.resolve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, resolve_care_abnormality_dto_1.ResolveCareAbnormalityDto]),
    __metadata("design:returntype", void 0)
], CareAbnormalityController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)(':id/ignore'),
    (0, require_permission_decorator_1.RequirePermission)('care.abnormality.ignore'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, resolve_care_abnormality_dto_1.ResolveCareAbnormalityDto]),
    __metadata("design:returntype", void 0)
], CareAbnormalityController.prototype, "ignore", null);
exports.CareAbnormalityController = CareAbnormalityController = __decorate([
    (0, swagger_1.ApiTags)('care/abnormality'),
    (0, common_1.Controller)('care/abnormalities'),
    __metadata("design:paramtypes", [care_abnormality_service_1.CareAbnormalityService])
], CareAbnormalityController);
//# sourceMappingURL=care-abnormality.controller.js.map