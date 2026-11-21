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
exports.BusinessReportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const business_report_service_1 = require("./business-report.service");
const query_business_report_dto_1 = require("./dto/query-business-report.dto");
let BusinessReportController = class BusinessReportController {
    businessReportService;
    constructor(businessReportService) {
        this.businessReportService = businessReportService;
    }
    getFinanceSummary(query) {
        return this.businessReportService.getFinanceSummary(query);
    }
    getOccupancySummary(query) {
        return this.businessReportService.getOccupancySummary(query);
    }
};
exports.BusinessReportController = BusinessReportController;
__decorate([
    (0, common_1.Get)('finance-summary'),
    (0, require_permission_decorator_1.RequirePermission)('analytics.dashboard.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_business_report_dto_1.QueryBusinessReportDto]),
    __metadata("design:returntype", void 0)
], BusinessReportController.prototype, "getFinanceSummary", null);
__decorate([
    (0, common_1.Get)('occupancy-summary'),
    (0, require_permission_decorator_1.RequirePermission)('analytics.dashboard.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_business_report_dto_1.QueryBusinessReportDto]),
    __metadata("design:returntype", void 0)
], BusinessReportController.prototype, "getOccupancySummary", null);
exports.BusinessReportController = BusinessReportController = __decorate([
    (0, swagger_1.ApiTags)('analytics/business-report'),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [business_report_service_1.BusinessReportService])
], BusinessReportController);
//# sourceMappingURL=business-report.controller.js.map