export declare const WS423_PERCENTILES: readonly [3, 10, 25, 50, 75, 90, 97];
export type GrowthMetric = 'weight' | 'length' | 'head';
export type GrowthSex = 'MALE' | 'FEMALE';
export declare const WS423_SOURCE = "\u300A7\u5C81\u4EE5\u4E0B\u513F\u7AE5\u751F\u957F\u6807\u51C6\u300BWS/T 423\u20142022\uFF08\u56FD\u5BB6\u536B\u751F\u5065\u5EB7\u59D4\u5458\u4F1A\uFF09";
export declare const WS423: Record<GrowthMetric, Record<GrowthSex, Record<number, number[]>>>;
