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
exports.BusinessAnalyticsAgentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const business_analytics_agent_service_1 = require("./business-analytics-agent.service");
const analyze_business_dto_1 = require("./dto/analyze-business.dto");
let BusinessAnalyticsAgentController = class BusinessAnalyticsAgentController {
    businessAnalyticsAgentService;
    constructor(businessAnalyticsAgentService) {
        this.businessAnalyticsAgentService = businessAnalyticsAgentService;
    }
    analyze(dto) {
        return this.businessAnalyticsAgentService.analyze(dto);
    }
};
exports.BusinessAnalyticsAgentController = BusinessAnalyticsAgentController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, require_permission_decorator_1.RequirePermission)('ai.business-analytics-agent.analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_business_dto_1.AnalyzeBusinessDto]),
    __metadata("design:returntype", void 0)
], BusinessAnalyticsAgentController.prototype, "analyze", null);
exports.BusinessAnalyticsAgentController = BusinessAnalyticsAgentController = __decorate([
    (0, swagger_1.ApiTags)('ai/business-analytics-agent'),
    (0, common_1.Controller)('ai/business-analytics-agent'),
    __metadata("design:paramtypes", [business_analytics_agent_service_1.BusinessAnalyticsAgentService])
], BusinessAnalyticsAgentController);
//# sourceMappingURL=business-analytics-agent.controller.js.map