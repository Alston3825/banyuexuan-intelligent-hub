import { MealRecordService } from './meal-record.service';
import { QueryMealRecordDto } from './dto/query-meal-record.dto';
import { SelectMealRecordDto } from './dto/select-meal-record.dto';
import { FeedbackMealRecordDto } from './dto/feedback-meal-record.dto';
import { QueryMealReportDto } from './dto/query-meal-report.dto';
export declare class MealRecordController {
    private readonly mealRecordService;
    constructor(mealRecordService: MealRecordService);
    findAll(query: QueryMealRecordDto): any;
    report(query: QueryMealReportDto): Promise<import("./meal-record.service").MealReport>;
    findOne(id: string): unknown;
    select(id: string, dto: SelectMealRecordDto): Promise<MealRecord>;
    serve(id: string): Promise<MealRecord>;
    feedback(id: string, dto: FeedbackMealRecordDto): Promise<MealRecord>;
}
