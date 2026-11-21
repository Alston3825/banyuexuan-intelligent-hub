import { MealRecordStatus } from '@prisma/client';
export declare class QueryMealRecordDto {
    dinerProfileId?: string;
    scheduledDate?: string;
    status?: MealRecordStatus;
}
