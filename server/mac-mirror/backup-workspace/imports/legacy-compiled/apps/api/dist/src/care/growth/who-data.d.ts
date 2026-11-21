import type { GrowthMetric, GrowthSex } from './ws423-data';
export declare const WHO_SOURCE = "WHO \u513F\u7AE5\u751F\u957F\u6807\u51C6\uFF08\u4E16\u754C\u536B\u751F\u7EC4\u7EC7\uFF09";
export declare const WHO_MAX_DAYS = 91;
export declare const WHO_DAILY: Record<GrowthMetric, Record<GrowthSex, number[][]>>;
