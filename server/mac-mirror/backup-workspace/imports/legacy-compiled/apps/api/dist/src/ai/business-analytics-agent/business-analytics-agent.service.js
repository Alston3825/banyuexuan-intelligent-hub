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
exports.BusinessAnalyticsAgentService = void 0;
const common_1 = require("@nestjs/common");
const business_report_service_1 = require("../../analytics/business-report/business-report.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const ai_gateway_client_1 = require("../ai-gateway/ai-gateway.client");
const ai_suggestion_service_1 = require("../ai-suggestion/ai-suggestion.service");
const SYSTEM_PROMPT = `你是伴月轩月子中心的经营分析助手，服务对象是店长/管理员。
基于系统提供的门店经营数据（收款、会员账户、房态入住率），生成简明的经营分析解读：
说明当前经营状况、指出值得关注的异常或趋势、给出可以进一步关注的方向。
严格要求：
1. 只依据提供的数据作答，不编造数据中没有的信息，不做超出数据范围的推测。
2. 你的分析仅供管理参考，不构成正式经营决策依据，最终决策需要管理者结合更多信息判断。
3. 只做只读分析，不要生成任何"已执行/已调整"之类暗示系统会自动操作的表述。`;
let BusinessAnalyticsAgentService = class BusinessAnalyticsAgentService {
    businessReportService;
    aiGatewayClient;
    aiSuggestionService;
    ctx;
    constructor(businessReportService, aiGatewayClient, aiSuggestionService, ctx) {
        this.businessReportService = businessReportService;
        this.aiGatewayClient = aiGatewayClient;
        this.aiSuggestionService = aiSuggestionService;
        this.ctx = ctx;
    }
    async analyze(dto) {
        const [financeSummary, occupancySummary] = await Promise.all([
            this.businessReportService.getFinanceSummary(dto),
            this.businessReportService.getOccupancySummary(dto),
        ]);
        const contextText = this.buildContext(financeSummary, occupancySummary);
        const userMessage = `【经营数据（${dto.startDate} ~ ${dto.endDate}）】\n${contextText}`;
        const startedAt = Date.now();
        const result = await this.aiGatewayClient.complete([
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
        ]);
        const latencyMs = result.latencyMs || Date.now() - startedAt;
        const storeScope = financeSummary.storeScope;
        const suggestion = await this.aiSuggestionService.record({
            storeId: dto.storeId ?? this.ctx.homeStoreId ?? storeScope,
            scenario: 'BUSINESS_ANALYTICS',
            businessType: 'BUSINESS_ANALYTICS_REPORT',
            businessId: `${storeScope}_${dto.startDate}_${dto.endDate}`,
            inputText: userMessage,
            outputText: result.content,
            modelProvider: result.provider,
            modelName: result.model,
            usedFallback: result.usedFallback,
            latencyMs,
        });
        return { suggestion, financeSummary, occupancySummary };
    }
    buildContext(finance, occupancy) {
        const yuan = (cents) => (cents / 100).toFixed(2);
        const byMethodText = finance.paymentByMethod.map((m) => `${m.method}:${yuan(m.amount)}元`).join('、') || '无';
        return [
            `统计范围：${finance.storeScope === 'ALL' ? '全租户汇总' : `门店${finance.storeScope}`}`,
            `【财务】`,
            `收款总额：${yuan(finance.paymentTotalAmount)}元（按支付方式：${byMethodText}）`,
            `已退款金额：${yuan(finance.paymentRefundedAmount)}元`,
            `会员账户-充值：${yuan(finance.accountRechargeAmount)}元，消费：${yuan(finance.accountConsumeAmount)}元，退款：${yuan(finance.accountRefundAmount)}元，人工调整：${yuan(finance.accountAdjustAmount)}元`,
            `会员账户当前总余额（截至现在）：${yuan(finance.accountCurrentBalance)}元`,
            `【房态】`,
            `房间总数：${occupancy.totalRooms}间`,
            `区间日均入住率：${(occupancy.averageOccupancyRate * 100).toFixed(1)}%`,
            `每日入住率明细：${occupancy.daily.map((d) => `${d.date}:${(d.occupancyRate * 100).toFixed(0)}%(${d.occupiedRooms}/${d.totalRooms})`).join('，')}`,
        ].join('\n');
    }
};
exports.BusinessAnalyticsAgentService = BusinessAnalyticsAgentService;
exports.BusinessAnalyticsAgentService = BusinessAnalyticsAgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [business_report_service_1.BusinessReportService,
        ai_gateway_client_1.AiGatewayClient,
        ai_suggestion_service_1.AiSuggestionService,
        request_context_service_1.RequestContextService])
], BusinessAnalyticsAgentService);
//# sourceMappingURL=business-analytics-agent.service.js.map