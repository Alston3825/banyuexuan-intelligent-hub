import { CarePlanVersionService, CareServiceLogService, PlanBody, ServiceLogBody } from './care-plan-version.service';
declare class PlanDto implements PlanBody {
    motherProfileId?: string;
    babyProfileId?: string | null;
    level?: string;
    source?: string;
    assessmentSummary?: string | null;
    focusPoints?: string | null;
    measures?: {
        title?: string;
        content?: string;
        frequency?: string;
    }[];
    progressNote?: string | null;
    adjustReason?: string | null;
    directActivate?: boolean;
    version?: number;
}
declare class VersionDto {
    version: number;
    comment?: string;
}
declare class RejectDto {
    version: number;
    comment: string;
}
declare class ServiceLogDto implements ServiceLogBody {
    motherProfileId: string;
    babyProfileId?: string | null;
    serviceCode: string;
    doneDate?: string;
    doneTime?: string;
    systolic?: number;
    diastolic?: number;
    heartRate?: number;
    weightKg?: number;
    doneByName?: string;
    clientSigned?: boolean;
    note?: string;
}
declare class ToggleDayDto {
    motherProfileId: string;
    babyProfileId?: string | null;
    serviceCode: string;
    date: string;
    done: boolean;
}
declare class ImportPreviewDto {
    documentId: string;
    babyProfileId?: string | null;
}
declare class ImportCommitDto extends ImportPreviewDto {
    items: {
        serviceCode: string;
        date: string;
        time?: string | null;
        systolic?: number | null;
        diastolic?: number | null;
        heartRate?: number | null;
        weightKg?: number | null;
        doneByName?: string | null;
        clientSigned?: boolean;
    }[];
}
export declare class CarePlanVersionController {
    private readonly service;
    private readonly logs;
    constructor(service: CarePlanVersionService, logs: CareServiceLogService);
    standards(): unknown;
    due(storeId?: string): unknown;
    list(motherProfileId: string): any;
    create(dto: PlanDto): unknown;
    update(id: string, dto: PlanDto): unknown;
    submit(id: string, dto: VersionDto): unknown;
    approve(id: string, dto: VersionDto): unknown;
    reject(id: string, dto: RejectDto): unknown;
    summary(motherProfileId: string): unknown;
    createLog(dto: ServiceLogDto): unknown;
    importPreview(dto: ImportPreviewDto): unknown;
    importCommit(dto: ImportCommitDto): unknown;
    toggleDay(dto: ToggleDayDto): unknown;
    removeLog(id: string): any;
}
export {};
