"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_gateway_module_1 = require("./ai-gateway/ai-gateway.module");
const ai_suggestion_module_1 = require("./ai-suggestion/ai-suggestion.module");
const knowledge_document_module_1 = require("./knowledge-document/knowledge-document.module");
const knowledge_retrieval_module_1 = require("./knowledge-retrieval/knowledge-retrieval.module");
const customer_service_agent_module_1 = require("./customer-service-agent/customer-service-agent.module");
const care_abnormality_agent_module_1 = require("./care-abnormality-agent/care-abnormality-agent.module");
const business_analytics_agent_module_1 = require("./business-analytics-agent/business-analytics-agent.module");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ai_gateway_module_1.AiGatewayModule,
            ai_suggestion_module_1.AiSuggestionModule,
            knowledge_document_module_1.KnowledgeDocumentModule,
            knowledge_retrieval_module_1.KnowledgeRetrievalModule,
            customer_service_agent_module_1.CustomerServiceAgentModule,
            care_abnormality_agent_module_1.CareAbnormalityAgentModule,
            business_analytics_agent_module_1.BusinessAnalyticsAgentModule,
        ],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map