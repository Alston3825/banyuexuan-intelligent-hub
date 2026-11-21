import { BusinessAnalyticsAgentService } from './business-analytics-agent.service';
import { AnalyzeBusinessDto } from './dto/analyze-business.dto';
export declare class BusinessAnalyticsAgentController {
    private readonly businessAnalyticsAgentService;
    constructor(businessAnalyticsAgentService: BusinessAnalyticsAgentService);
    analyze(dto: AnalyzeBusinessDto): Promise<import("./business-analytics-agent.service").BusinessAnalysisResult>;
}
