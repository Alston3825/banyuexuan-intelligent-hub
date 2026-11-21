export type LevelCode = 'LEVEL1' | 'LEVEL2' | 'LEVEL3';
export type Freq = {
    kind: 'DAILY';
    days?: number;
} | {
    kind: 'DAILY_TIMES';
    times: number;
    days: number;
} | {
    kind: 'EVERY_N_DAYS';
    n: number;
} | {
    kind: 'WEEKLY';
    afterDay?: number;
    perWeek?: number;
} | {
    kind: 'ONCE';
} | {
    kind: 'AS_NEEDED';
};
export interface ServiceStd {
    code: string;
    name: string;
    subject: 'MOTHER' | 'BABY';
    group: 'ITEM' | 'EDU';
    freq: Freq;
}
export type MeasureKind = 'BP' | 'WEIGHT';
export declare const SERVICE_MEASURE: Record<string, MeasureKind>;
export declare const LEVEL_LABEL: Record<LevelCode, string>;
export declare const LEVEL_STANDARDS: Record<LevelCode, {
    label: string;
    desc: string;
    services: ServiceStd[];
}>;
export declare function freqText(f: Freq): string;
export declare function expectedCount(f: Freq, stayDay: number): number | null;
export declare const allServiceCodes: () => Set<string>;
