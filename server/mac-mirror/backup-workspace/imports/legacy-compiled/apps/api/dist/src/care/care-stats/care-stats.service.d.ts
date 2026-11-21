import { PrismaService } from '../../prisma/prisma.service';
import { RequestContextService } from '../../common/context/request-context.service';
type Op = 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
export interface Metric {
    code: string;
    label: string;
    subject: 'BABY' | 'MOTHER';
    unit: string;
    presets: {
        label: string;
        op: Op;
        value: number;
    }[];
}
export declare const METRICS: Metric[];
export declare class CareStatsService {
    private readonly prisma;
    private readonly ctx;
    constructor(prisma: PrismaService, ctx: RequestContextService);
    metrics(): {};
    query(q: {
        metric: string;
        op: string;
        value: string | number;
        from?: string;
        to?: string;
        storeId?: string;
    }): unknown;
    summary(motherProfileId: string): unknown;
}
export {};
