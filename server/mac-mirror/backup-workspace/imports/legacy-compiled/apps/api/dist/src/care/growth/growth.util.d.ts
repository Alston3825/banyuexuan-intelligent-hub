import { GrowthMetric, GrowthSex } from './ws423-data';
export type GrowthStandard = 'CN' | 'WHO';
export declare const STANDARD_INFO: Record<GrowthStandard, {
    label: string;
    source: string;
}>;
export declare const parseStandard: (v: unknown) => GrowthStandard;
export declare const MONTH_DAYS = 30.4375;
export declare const METRIC_LABEL: Record<GrowthMetric, {
    name: string;
    unit: string;
}>;
export declare const maxAgeMonths: (metric: GrowthMetric) => any;
export declare function standardRow(metric: GrowthMetric, sex: GrowthSex, ageMonths: number, standard?: GrowthStandard): number[] | null;
export type Rating = '上' | '中上' | '中' | '中下' | '下';
export declare function rate(value: number, row: number[]): Rating;
export declare function estimatePercentile(value: number, row: number[]): {
    pct: number | null;
    beyond: 'below' | 'above' | null;
};
export declare function ageInMonths(birth: Date, at: Date, gestationalWeeks?: number | null): {
    months: number | null;
    days: number;
    corrected: boolean;
};
export declare function describeMetric(metric: GrowthMetric, value: number, row: number[]): {
    rating: Rating;
    pctText: string;
    text: string;
};
