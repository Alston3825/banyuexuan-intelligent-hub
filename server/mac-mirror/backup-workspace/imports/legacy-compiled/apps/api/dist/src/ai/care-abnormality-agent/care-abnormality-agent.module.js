"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareAbnormalityAgentModule = void 0;
const common_1 = require("@nestjs/common");
const care_abnormality_module_1 = require("../../care/care-abnormality/care-abnormality.module");
const ai_gateway_module_1 = require("../ai-gateway/ai-gateway.module");
const ai_suggestion_module_1 = require("../ai-suggestion/ai-suggestion.module");
const knowledge_retrieval_module_1 = require("../knowledge-retrieval/knowledge-retrieval.module");
const care_abnormality_agent_controller_1 = require("./care-abnormality-agent.controller");
const care_abnormality_agent_service_1 = require("./care-abnormality-agent.service");
let CareAbnormalityAgentModule = class CareAbnormalityAgentModule {
};
exports.CareAbnormalityAgentModule = CareAbnormalityAgentModule;
exports.CareAbnormalityAgentModule = CareAbnormalityAgentModule = __decorate([
    (0, common_1.Module)({
        imports: [care_abnormality_module_1.CareAbnormalityModule, ai_gateway_module_1.AiGatewayModule, ai_suggestion_module_1.AiSuggestionModule, knowledge_retrieval_module_1.KnowledgeRetrievalModule],
        controllers: [care_abnormality_agent_controller_1.CareAbnormalityAgentController],
        providers: [care_abnormality_agent_service_1.CareAbnormalityAgentService],
    })
], CareAbnormalityAgentModule);
//# sourceMappingURL=care-abnormality-agent.module.js.map