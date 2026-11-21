import { CareFormDepartment, CareFormScene, CareTargetType } from '@prisma/client';
import { CareFormTemplateFieldDto } from './care-form-template-field.dto';
export declare class CreateCareFormTemplateDto {
    code: string;
    name: string;
    targetType: CareTargetType;
    department: CareFormDepartment;
    scene: CareFormScene;
    fields: CareFormTemplateFieldDto[];
}
