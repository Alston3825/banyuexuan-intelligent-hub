import { CareDailyService } from './care-daily.service';
declare class SaveDayBody {
    motherProfileId: string;
    date: string;
    documentId?: string | null;
    version?: number;
    mother: Record<string, unknown>;
    babies: {
        babyProfileId: string;
        values: Record<string, unknown>;
        feedings?: Record<string, unknown>[];
        nursings?: Record<string, unknown>[];
    }[];
}
export declare class CareDailyController {
    private readonly service;
    constructor(service: CareDailyService);
    specs(): {
        mother: {};
        baby: {};
        feeding: {};
        nursing: {};
    };
    days(motherProfileId: string): unknown;
    pending(storeId?: string, date?: string): unknown;
    day(motherProfileId: string, date: string): unknown;
    save(dto: SaveDayBody): unknown;
}
export {};
