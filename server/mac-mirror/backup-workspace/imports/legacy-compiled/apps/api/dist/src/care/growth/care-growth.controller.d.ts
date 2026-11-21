import { CareGrowthService } from './care-growth.service';
declare class GrowthRecordDto {
    babyProfileId: string;
    measuredAt: string;
    weightG?: number | null;
    lengthCm?: number | null;
    headCm?: number | null;
    note?: string | null;
}
export declare class CareGrowthController {
    private readonly service;
    constructor(service: CareGrowthService);
    report(babyId: string, standard?: string): unknown;
    addRecord(dto: GrowthRecordDto): unknown;
    removeRecord(id: string): any;
    share(babyId: string): unknown;
    revoke(babyId: string): unknown;
}
export declare class PublicGrowthController {
    private readonly service;
    constructor(service: CareGrowthService);
    report(token: string, standard?: string): unknown;
}
export {};
