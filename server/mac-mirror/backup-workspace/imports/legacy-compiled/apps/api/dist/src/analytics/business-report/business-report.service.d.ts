import { PrismaService } from '../../prisma/prisma.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
import { QueryBusinessReportDto } from './dto/query-business-report.dto';
export interface FinanceSummary {
    storeScope: string;
    paymentTotalAmount: number;
    paymentRefundedAmount: number;
    paymentByMethod: {
        method: string;
        amount: number;
    }[];
    accountRechargeAmount: number;
    accountConsumeAmount: number;
    accountRefundAmount: number;
    accountAdjustAmount: number;
    accountCurrentBalance: number;
}
export interface OccupancyDailyPoint {
    date: string;
    occupiedRooms: number;
    totalRooms: number;
    occupancyRate: number;
}
export interface OccupancySummary {
    storeScope: string;
    totalRooms: number;
    averageOccupancyRate: number;
    daily: OccupancyDailyPoint[];
}
export declare class BusinessReportService {
    private readonly prisma;
    private readonly dataScopeService;
    private readonly ctx;
    constructor(prisma: PrismaService, dataScopeService: DataScopeService, ctx: RequestContextService);
    getFinanceSummary(query: QueryBusinessReportDto): Promise<FinanceSummary>;
    getOccupancySummary(query: QueryBusinessReportDto): Promise<OccupancySummary>;
    private resolveStoreScope;
    private dateRange;
}
