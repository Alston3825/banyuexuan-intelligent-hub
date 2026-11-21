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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerServiceAgentService = void 0;
const common_1 = require("@nestjs/common");
const lead_service_1 = require("../../crm/lead/lead.service");
const customer_service_1 = require("../../crm/customer/customer.service");
const follow_up_service_1 = require("../../crm/follow-up/follow-up.service");
const ai_gateway_client_1 = require("../ai-gateway/ai-gateway.client");
const ai_suggestion_service_1 = require("../ai-suggestion/ai-suggestion.service");
const knowledge_retrieval_service_1 = require("../knowledge-retrieval/knowledge-retrieval.service");
const ESCALATE_MARKER = '[[ESCALATE]]';
const SYSTEM_PROMPT = `你是伴月轩月子中心的内部客服助手，服务对象是门店员工（销售/客服），不是直接面向客户对话。
你的任务是基于系统提供的客户/线索背景资料，帮员工快速理解情况、给出沟通建议或信息查询结果。
严格要求：
1. 只依据提供的背景资料作答，不要编造资料中没有的信息（如具体报价、优惠承诺）。
2. 如果问题涉及最终报价、法律条款、投诉处理等复杂或敏感事项，或者背景资料不足以回答，
   请在回答末尾追加一行 ${ESCALATE_MARKER}，提示需要转人工处理。
3. 回答仅供员工参考，不代表最终决定。`;
let CustomerServiceAgentService = class CustomerServiceAgentService {
    leadService;
    customerService;
    followUpService;
    aiGatewayClient;
    aiSuggestionService;
    knowledgeRetrievalService;
    constructor(leadService, customerService, followUpService, aiGatewayClient, aiSuggestionService, knowledgeRetrievalService) {
        this.leadService = leadService;
        this.customerService = customerService;
        this.followUpService = followUpService;
        this.aiGatewayClient = aiGatewayClient;
        this.aiSuggestionService = aiSuggestionService;
        this.knowledgeRetrievalService = knowledgeRetrievalService;
    }
    async ask(dto) {
        const [contextText, knowledgeText] = await Promise.all([
            this.buildContext(dto.businessType, dto.businessId),
            this.buildKnowledgeContext(dto.question),
        ]);
        const userMessage = [
            `【客户/线索背景资料】\n${contextText}`,
            knowledgeText ? `【知识库参考资料】\n${knowledgeText}` : null,
            `【员工提问】\n${dto.question}`,
        ]
            .filter(Boolean)
            .join('\n\n');
        const startedAt = Date.now();
        const result = await this.aiGatewayClient.complete([
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
        ]);
        const latencyMs = result.latencyMs || Date.now() - startedAt;
        const escalate = result.content.includes(ESCALATE_MARKER);
        const answer = result.content.replace(ESCALATE_MARKER, '').trim();
        const suggestion = await this.aiSuggestionService.record({
            storeId: dto.storeId,
            scenario: 'CUSTOMER_SERVICE',
            businessType: dto.businessType,
            businessId: dto.businessId,
            inputText: userMessage,
            outputText: answer,
            modelProvider: result.provider,
            modelName: result.model,
            usedFallback: result.usedFallback,
            latencyMs,
            escalate,
        });
        return { suggestion, answer, escalate };
    }
    async buildKnowledgeContext(question) {
        const chunks = await this.knowledgeRetrievalService.search(question);
        if (chunks.length === 0)
            return null;
        return chunks.map((c) => `[来源:${c.documentTitle}] ${c.content}`).join('\n\n');
    }
    async buildContext(businessType, businessId) {
        if (businessType === 'LEAD') {
            const lead = await this.leadService.findOneOrThrow(businessId);
            const followUps = await this.followUpService.findMany('LEAD', businessId);
            const recentFollowUps = followUps
                .slice(0, 5)
                .map((f) => `- ${f.createdAt.toISOString().slice(0, 10)} [${f.type}] ${f.content}`)
                .join('\n');
            return [
                `线索姓名：${lead.name}`,
                `联系电话：${lead.phone}`,
                `来源：${lead.source}`,
                `当前状态：${lead.status}`,
                lead.remark ? `备注：${lead.remark}` : null,
                recentFollowUps ? `最近跟进记录：\n${recentFollowUps}` : '暂无跟进记录',
            ]
                .filter(Boolean)
                .join('\n');
        }
        const customer = await this.customerService.findOneOrThrow(businessId);
        if (!customer)
            throw new common_1.NotFoundException(`Customer ${businessId} 不存在`);
        const followUps = await this.followUpService.findMany('CUSTOMER', businessId);
        const recentFollowUps = followUps
            .slice(0, 5)
            .map((f) => `- ${f.createdAt.toISOString().slice(0, 10)} [${f.type}] ${f.content}`)
            .join('\n');
        return [
            `客户姓名：${customer.name}`,
            `联系电话：${customer.phone}`,
            `客户来源：${customer.source}`,
            customer.remark ? `备注：${customer.remark}` : null,
            recentFollowUps ? `最近跟进记录：\n${recentFollowUps}` : '暂无跟进记录',
        ]
            .filter(Boolean)
            .join('\n');
    }
};
exports.CustomerServiceAgentService = CustomerServiceAgentService;
exports.CustomerServiceAgentService = CustomerServiceAgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [lead_service_1.LeadService,
        customer_service_1.CustomerService,
        follow_up_service_1.FollowUpService,
        ai_gateway_client_1.AiGatewayClient,
        ai_suggestion_service_1.AiSuggestionService,
        knowledge_retrieval_service_1.KnowledgeRetrievalService])
], CustomerServiceAgentService);
//# sourceMappingURL=customer-service-agent.service.js.map