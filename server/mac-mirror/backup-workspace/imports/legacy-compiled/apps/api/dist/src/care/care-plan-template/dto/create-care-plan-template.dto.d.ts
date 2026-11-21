import { CareTargetType } from '@prisma/client';
import { CarePlanTemplateItemDto } from './care-plan-template-item.dto';
export declare class CreateCarePlanTemplateDto {
    code: string;
    name: string;
    targetType: CareTargetType;
    totalDays: number;
    items: CarePlanTemplateItemDto[];
}
