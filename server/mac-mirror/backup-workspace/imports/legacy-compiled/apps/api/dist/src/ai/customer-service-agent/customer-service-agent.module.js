"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerServiceAgentModule = void 0;
const common_1 = require("@nestjs/common");
const lead_module_1 = require("../../crm/lead/lead.module");
const customer_module_1 = require("../../crm/customer/customer.module");
const follow_up_module_1 = require("../../crm/follow-up/follow-up.module");
const ai_gateway_module_1 = require("../ai-gateway/ai-gateway.module");
const ai_suggestion_module_1 = require("../ai-suggestion/ai-suggestion.module");
const knowledge_retrieval_module_1 = require("../knowledge-retrieval/knowledge-retrieval.module");
const customer_service_agent_controller_1 = require("./customer-service-agent.controller");
const customer_service_agent_service_1 = require("./customer-service-agent.service");
let CustomerServiceAgentModule = class CustomerServiceAgentModule {
};
exports.CustomerServiceAgentModule = CustomerServiceAgentModule;
exports.CustomerServiceAgentModule = CustomerServiceAgentModule = __decorate([
    (0, common_1.Module)({
        imports: [lead_module_1.LeadModule, customer_module_1.CustomerModule, follow_up_module_1.FollowUpModule, ai_gateway_module_1.AiGatewayModule, ai_suggestion_module_1.AiSuggestionModule, knowledge_retrieval_module_1.KnowledgeRetrievalModule],
        controllers: [customer_service_agent_controller_1.CustomerServiceAgentController],
        providers: [customer_service_agent_service_1.CustomerServiceAgentService],
    })
], CustomerServiceAgentModule);
//# sourceMappingURL=customer-service-agent.module.js.map