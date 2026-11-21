import { MealRecord } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { QueryMealRecordDto } from './dto/query-meal-record.dto';
import { SelectMealRecordDto } from './dto/select-meal-record.dto';
import { FeedbackMealRecordDto } from './dto/feedback-meal-record.dto';
import { QueryMealReportDto } from './dto/query-meal-report.dto';
export interface MealReport {
    totalRecords: number;
    plannedCount: number;
    servedCount: number;
    cancelledCount: number;
    customSelectedCount: number;
    avgRating: number | null;
    bySlot: Record<string, number>;
    byMealItem: {
        mealItemId: string;
        name: string;
        servedCount: number;
    }[];
}
export declare class MealRecordService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryMealRecordDto): any;
    report(query?: QueryMealReportDto): Promise<MealReport>;
    findOneOrThrow(id: string): unknown;
    select(id: string, dto: SelectMealRecordDto): Promise<MealRecord>;
    serve(id: string): Promise<MealRecord>;
    feedback(id: string, dto: FeedbackMealRecordDto): Promise<MealRecord>;
    private assertWithinSelectWindow;
    private assertNoIngredientConflict;
    private auditCtx;
}
