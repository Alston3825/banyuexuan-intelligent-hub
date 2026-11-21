import { AiSuggestion } from '@prisma/client';
import { BusinessReportService, FinanceSummary, OccupancySummary } from '../../analytics/business-report/business-report.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { AiGatewayClient } from '../ai-gateway/ai-gateway.client';
import { AiSuggestionService } from '../ai-suggestion/ai-suggestion.service';
import { AnalyzeBusinessDto } from './dto/analyze-business.dto';
export interface BusinessAnalysisResult {
    suggestion: AiSuggestion;
    financeSummary: FinanceSummary;
    occupancySummary: OccupancySummary;
}
export declare class BusinessAnalyticsAgentService {
    private readonly businessReportService;
    private readonly aiGatewayClient;
    private readonly aiSuggestionService;
    private readonly ctx;
    constructor(businessReportService: BusinessReportService, aiGatewayClient: AiGatewayClient, aiSuggestionService: AiSuggestionService, ctx: RequestContextService);
    analyze(dto: AnalyzeBusinessDto): Promise<BusinessAnalysisResult>;
    private buildContext;
}
