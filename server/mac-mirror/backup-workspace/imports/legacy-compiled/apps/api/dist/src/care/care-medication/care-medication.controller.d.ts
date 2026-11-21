import { CareMedicationService } from './care-medication.service';
declare class MedicationBody {
    motherProfileId?: string;
    babyProfileId?: string;
    previousAuthId?: string;
    changeNote?: string;
    documentId?: string | null;
    version?: number;
    header: Record<string, unknown>;
    items: Record<string, unknown>[];
}
declare class StopBody {
    version: number;
    note: string;
}
export declare class CareMedicationController {
    private readonly service;
    constructor(service: CareMedicationService);
    specs(): {
        header: {};
        item: {};
    };
    list(motherProfileId?: string, babyProfileId?: string): any;
    create(dto: MedicationBody): unknown;
    update(id: string, dto: MedicationBody): unknown;
    stop(id: string, dto: StopBody): unknown;
}
export {};
