import { CommonStatus } from '@prisma/client';
import { CareOutreachTemplateItemDto } from './care-outreach-template-item.dto';
export declare class UpdateCareOutreachTemplateDto {
    name?: string;
    status?: CommonStatus;
    items?: CareOutreachTemplateItemDto[];
    version: number;
}
