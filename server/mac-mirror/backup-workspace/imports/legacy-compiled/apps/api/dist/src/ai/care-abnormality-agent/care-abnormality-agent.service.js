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
exports.CareAbnormalityAgentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const care_abnormality_service_1 = require("../../care/care-abnormality/care-abnormality.service");
const ai_gateway_client_1 = require("../ai-gateway/ai-gateway.client");
const ai_suggestion_service_1 = require("../ai-suggestion/ai-suggestion.service");
const knowledge_retrieval_service_1 = require("../knowledge-retrieval/knowledge-retrieval.service");
const SYSTEM_PROMPT = `你是伴月轩月子中心的护理助手，服务对象是护理师，不是产妇/家属。
你的任务是基于系统提供的护理异常信息，给出可能的原因分析与建议的跟进方向，帮助护理师判断。
严格要求：
1. 你的输出只是建议，不是医疗诊断，不构成任何医嘱。
2. 护理师必须自行判断并人工确认后，才能将处理结果写入正式护理记录——你没有任何直接写入
   护理档案的权限，也不应在回答中暗示"已经处理"。
3. 回答控制在3句话以内，直接给出可能原因与下一步建议，不要输出免责声明以外的客套话。`;
let CareAbnormalityAgentService = class CareAbnormalityAgentService {
    prisma;
    careAbnormalityService;
    aiGatewayClient;
    aiSuggestionService;
    knowledgeRetrievalService;
    constructor(prisma, careAbnormalityService, aiGatewayClient, aiSuggestionService, knowledgeRetrievalService) {
        this.prisma = prisma;
        this.careAbnormalityService = careAbnormalityService;
        this.aiGatewayClient = aiGatewayClient;
        this.aiSuggestionService = aiSuggestionService;
        this.knowledgeRetrievalService = knowledgeRetrievalService;
    }
    async suggest(abnormalityId) {
        const abnormality = await this.careAbnormalityService.findOneOrThrow(abnormalityId);
        const contextText = await this.buildContext(abnormality);
        const knowledgeChunks = await this.knowledgeRetrievalService.search(contextText);
        const knowledgeText = knowledgeChunks.length > 0 ? `\n\n【护理知识库参考资料】\n${knowledgeChunks.map((c) => `[来源:${c.documentTitle}] ${c.content}`).join('\n\n')}` : '';
        const startedAt = Date.now();
        const result = await this.aiGatewayClient.complete([
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: contextText + knowledgeText },
        ]);
        const latencyMs = result.latencyMs || Date.now() - startedAt;
        const suggestion = await this.aiSuggestionService.record({
            storeId: abnormality.storeId,
            scenario: 'CARE_ABNORMALITY',
            businessType: 'CARE_ABNORMALITY',
            businessId: abnormalityId,
            inputText: contextText + knowledgeText,
            outputText: result.content,
            modelProvider: result.provider,
            modelName: result.model,
            usedFallback: result.usedFallback,
            latencyMs,
        });
        return { suggestion, answer: result.content };
    }
    async buildContext(abnormality) {
        const field = await this.prisma.careFieldDefinition.findUnique({ where: { id: abnormality.fieldId } });
        const normalRange = field?.normalOptionValues
            ? `正常选项：${JSON.stringify(field.normalOptionValues)}`
            : `正常范围：${field?.normalMin ?? '不限'} ~ ${field?.normalMax ?? '不限'}${field?.unit ? ` ${field.unit}` : ''}`;
        let subject = '未知对象';
        if (abnormality.babyProfileId) {
            const baby = await this.prisma.babyProfile.findUnique({ where: { id: abnormality.babyProfileId } });
            subject = `宝宝${baby?.name ? `（${baby.name}）` : `${baby?.sequenceNo ?? ''}号`}`;
        }
        else if (abnormality.motherProfileId) {
            const mother = await this.prisma.motherProfile.findUnique({ where: { id: abnormality.motherProfileId }, include: { customer: true } });
            subject = `妈妈（${mother?.customer.name ?? '未知'}）`;
        }
        return [
            `对象：${subject}`,
            `异常项目：${field?.name ?? abnormality.fieldId}`,
            `记录时间：${abnormality.occurredAt.toISOString()}`,
            `实际值：${JSON.stringify(abnormality.fieldValue)}`,
            normalRange,
            '请给出可能原因与建议的护理跟进方向。',
        ].join('\n');
    }
};
exports.CareAbnormalityAgentService = CareAbnormalityAgentService;
exports.CareAbnormalityAgentService = CareAbnormalityAgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        care_abnormality_service_1.CareAbnormalityService,
        ai_gateway_client_1.AiGatewayClient,
        ai_suggestion_service_1.AiSuggestionService,
        knowledge_retrieval_service_1.KnowledgeRetrievalService])
], CareAbnormalityAgentService);
//# sourceMappingURL=care-abnormality-agent.service.js.map