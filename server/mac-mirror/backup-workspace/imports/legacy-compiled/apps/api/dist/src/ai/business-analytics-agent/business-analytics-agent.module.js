"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessAnalyticsAgentModule = void 0;
const common_1 = require("@nestjs/common");
const business_report_module_1 = require("../../analytics/business-report/business-report.module");
const ai_gateway_module_1 = require("../ai-gateway/ai-gateway.module");
const ai_suggestion_module_1 = require("../ai-suggestion/ai-suggestion.module");
const business_analytics_agent_controller_1 = require("./business-analytics-agent.controller");
const business_analytics_agent_service_1 = require("./business-analytics-agent.service");
let BusinessAnalyticsAgentModule = class BusinessAnalyticsAgentModule {
};
exports.BusinessAnalyticsAgentModule = BusinessAnalyticsAgentModule;
exports.BusinessAnalyticsAgentModule = BusinessAnalyticsAgentModule = __decorate([
    (0, common_1.Module)({
        imports: [business_report_module_1.BusinessReportModule, ai_gateway_module_1.AiGatewayModule, ai_suggestion_module_1.AiSuggestionModule],
        controllers: [business_analytics_agent_controller_1.BusinessAnalyticsAgentController],
        providers: [business_analytics_agent_service_1.BusinessAnalyticsAgentService],
    })
], BusinessAnalyticsAgentModule);
//# sourceMappingURL=business-analytics-agent.module.js.map