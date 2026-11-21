import { CareAssessmentService } from './care-assessment.service';
declare class CreateAssessmentDto {
    profileId: string;
    documentId?: string;
    values: Record<string, unknown>;
}
declare class UpdateAssessmentDto {
    version: number;
    documentId?: string | null;
    values: Record<string, unknown>;
}
export declare class CareAssessmentController {
    private readonly service;
    constructor(service: CareAssessmentService);
    specs(): {};
    overview(motherProfileId: string): unknown;
    create(type: string, dto: CreateAssessmentDto): unknown;
    update(type: string, id: string, dto: UpdateAssessmentDto): unknown;
}
export {};
