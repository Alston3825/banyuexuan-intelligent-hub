import { CareFormScene } from '@prisma/client';
import { CareFormTemplateFieldDto } from './care-form-template-field.dto';
export declare class UpdateCareFormTemplateDto {
    name?: string;
    scene?: CareFormScene;
    status?: 'ACTIVE' | 'INACTIVE';
    fields?: CareFormTemplateFieldDto[];
    version: number;
}
