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
exports.CareStatsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_stats_service_1 = require("./care-stats.service");
let CareStatsController = class CareStatsController {
    service;
    constructor(service) {
        this.service = service;
    }
    metrics() {
        return this.service.metrics();
    }
    query(metric, op, value, from, to, storeId) {
        return this.service.query({ metric, op, value, from, to, storeId });
    }
    summary(motherProfileId) {
        return this.service.summary(motherProfileId);
    }
};
exports.CareStatsController = CareStatsController;
__decorate([
    (0, common_1.Get)('stats/metrics'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CareStatsController.prototype, "metrics", null);
__decorate([
    (0, common_1.Get)('stats/query'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)('metric')),
    __param(1, (0, common_1.Query)('op')),
    __param(2, (0, common_1.Query)('value')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __param(5, (0, common_1.Query)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CareStatsController.prototype, "query", null);
__decorate([
    (0, common_1.Get)('summary/:motherProfileId'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Param)('motherProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareStatsController.prototype, "summary", null);
exports.CareStatsController = CareStatsController = __decorate([
    (0, swagger_1.ApiTags)('care/stats'),
    (0, common_1.Controller)('care'),
    __metadata("design:paramtypes", [care_stats_service_1.CareStatsService])
], CareStatsController);
//# sourceMappingURL=care-stats.controller.js.map