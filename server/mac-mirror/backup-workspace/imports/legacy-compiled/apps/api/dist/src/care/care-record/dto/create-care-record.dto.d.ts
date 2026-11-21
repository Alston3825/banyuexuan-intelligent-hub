export declare class CreateCareRecordDto {
    formTemplateId: string;
    motherProfileId?: string;
    babyProfileId?: string;
    occurredAt: string;
    values: Record<string, unknown>;
    carePlanTaskId?: string;
    isBackfilled?: boolean;
    backfillReason?: string;
    correctionOfId?: string;
}
