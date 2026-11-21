"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxAgeMonths = exports.METRIC_LABEL = exports.MONTH_DAYS = exports.parseStandard = exports.STANDARD_INFO = void 0;
exports.standardRow = standardRow;
exports.rate = rate;
exports.estimatePercentile = estimatePercentile;
exports.ageInMonths = ageInMonths;
exports.describeMetric = describeMetric;
const ws423_data_1 = require("./ws423-data");
const who_data_1 = require("./who-data");
exports.STANDARD_INFO = {
    CN: { label: '国家卫健委标准', source: ws423_data_1.WS423_SOURCE },
    WHO: { label: 'WHO 标准', source: who_data_1.WHO_SOURCE },
};
const parseStandard = (v) => (String(v).toUpperCase() === 'WHO' ? 'WHO' : 'CN');
exports.parseStandard = parseStandard;
const DAY_MS = 86_400_000;
exports.MONTH_DAYS = 30.4375;
exports.METRIC_LABEL = {
    weight: { name: '体重', unit: 'g' },
    length: { name: '身长', unit: 'cm' },
    head: { name: '头围', unit: 'cm' },
};
const agesCache = new Map();
function agesOf(metric, sex) {
    const k = `${metric}|${sex}`;
    let a = agesCache.get(k);
    if (!a) {
        a = Object.keys(ws423_data_1.WS423[metric][sex]).map(Number).sort((x, y) => x - y);
        agesCache.set(k, a);
    }
    return a;
}
const maxAgeMonths = (metric) => agesOf(metric, 'MALE').at(-1);
exports.maxAgeMonths = maxAgeMonths;
function standardRow(metric, sex, ageMonths, standard = 'CN') {
    if (standard === 'WHO')
        return whoRow(metric, sex, ageMonths);
    const ages = agesOf(metric, sex);
    if (ageMonths < 0 || ageMonths > ages.at(-1))
        return null;
    const table = ws423_data_1.WS423[metric][sex];
    let lo = ages[0];
    for (const a of ages) {
        if (a <= ageMonths)
            lo = a;
        else {
            const hi = a;
            const t = (ageMonths - lo) / (hi - lo);
            return table[lo].map((v, i) => Math.round((v + (table[hi][i] - v) * t) * 100) / 100);
        }
    }
    return table[lo];
}
function whoRow(metric, sex, ageMonths) {
    const days = ageMonths * exports.MONTH_DAYS;
    if (days < 0 || days > who_data_1.WHO_MAX_DAYS + 1)
        return null;
    const t = who_data_1.WHO_DAILY[metric][sex];
    const d = Math.min(days, who_data_1.WHO_MAX_DAYS);
    const lo = Math.floor(d);
    const hi = Math.min(lo + 1, who_data_1.WHO_MAX_DAYS);
    const f = d - lo;
    return t[lo].map((v, i) => Math.round((v + (t[hi][i] - v) * f) * 1000) / 1000);
}
function rate(value, row) {
    if (value >= row[6])
        return '上';
    if (value >= row[4])
        return '中上';
    if (value >= row[2])
        return '中';
    if (value >= row[0])
        return '中下';
    return '下';
}
function estimatePercentile(value, row) {
    if (value < row[0])
        return { pct: null, beyond: 'below' };
    if (value > row[6])
        return { pct: null, beyond: 'above' };
    for (let i = 0; i < 6; i++) {
        if (value <= row[i + 1]) {
            const t = row[i + 1] === row[i] ? 0 : (value - row[i]) / (row[i + 1] - row[i]);
            return { pct: Math.round(ws423_data_1.WS423_PERCENTILES[i] + (ws423_data_1.WS423_PERCENTILES[i + 1] - ws423_data_1.WS423_PERCENTILES[i]) * t), beyond: null };
        }
    }
    return { pct: 97, beyond: null };
}
function ageInMonths(birth, at, gestationalWeeks) {
    const days = Math.round((at.getTime() - birth.getTime()) / DAY_MS);
    if (gestationalWeeks && gestationalWeeks < 37 && days < 730) {
        const corrected = days - (40 - gestationalWeeks) * 7;
        return { months: corrected < 0 ? null : corrected / exports.MONTH_DAYS, days, corrected: true };
    }
    return { months: days < 0 ? null : days / exports.MONTH_DAYS, days, corrected: false };
}
function describeMetric(metric, value, row) {
    const r = rate(value, row);
    const e = estimatePercentile(value, row);
    const pctText = e.pct !== null ? `约第 ${e.pct} 百分位` : e.beyond === 'below' ? '低于第 3 百分位' : '高于第 97 百分位';
    const { name, unit } = exports.METRIC_LABEL[metric];
    const level = { 上: '偏高（上）', 中上: '中上', 中: '中等', 中下: '中下', 下: '偏低（下）' }[r];
    return { rating: r, pctText, text: `${name} ${value}${unit}：${pctText}，生长水平${level}` };
}
//# sourceMappingURL=growth.util.js.map