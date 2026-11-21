export declare class UpdateCareFieldDefinitionDto {
    name?: string;
    unit?: string;
    options?: {
        value: string;
        label: string;
    }[];
    normalMin?: number;
    normalMax?: number;
    normalOptionValues?: string[];
    visibleToClient?: boolean;
    status?: 'ACTIVE' | 'INACTIVE';
    version: number;
}
