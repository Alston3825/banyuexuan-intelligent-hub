import { CarePlanTemplateItemDto } from './care-plan-template-item.dto';
export declare class UpdateCarePlanTemplateDto {
    name?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    items?: CarePlanTemplateItemDto[];
    version: number;
}
