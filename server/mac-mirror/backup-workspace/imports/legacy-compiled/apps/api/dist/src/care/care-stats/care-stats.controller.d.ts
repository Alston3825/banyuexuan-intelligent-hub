import { CareStatsService } from './care-stats.service';
export declare class CareStatsController {
    private readonly service;
    constructor(service: CareStatsService);
    metrics(): {};
    query(metric: string, op: string, value: string, from?: string, to?: string, storeId?: string): unknown;
    summary(motherProfileId: string): unknown;
}
