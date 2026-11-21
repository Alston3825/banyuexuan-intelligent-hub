import { BusinessReportService } from './business-report.service';
import { QueryBusinessReportDto } from './dto/query-business-report.dto';
export declare class BusinessReportController {
    private readonly businessReportService;
    constructor(businessReportService: BusinessReportService);
    getFinanceSummary(query: QueryBusinessReportDto): Promise<import("./business-report.service").FinanceSummary>;
    getOccupancySummary(query: QueryBusinessReportDto): Promise<import("./business-report.service").OccupancySummary>;
}
