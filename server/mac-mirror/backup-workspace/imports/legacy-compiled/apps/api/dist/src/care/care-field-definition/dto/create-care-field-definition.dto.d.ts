import { CareFieldControlType, CareTargetType } from '@prisma/client';
export declare class CreateCareFieldDefinitionDto {
    code: string;
    name: string;
    targetType: CareTargetType;
    controlType: CareFieldControlType;
    unit?: string;
    options?: {
        value: string;
        label: string;
    }[];
    normalMin?: number;
    normalMax?: number;
    normalOptionValues?: string[];
    visibleToClient?: boolean;
}
