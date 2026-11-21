"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allServiceCodes = exports.LEVEL_STANDARDS = exports.LEVEL_LABEL = exports.SERVICE_MEASURE = void 0;
exports.freqText = freqText;
exports.expectedCount = expectedCount;
exports.SERVICE_MEASURE = { BP: 'BP', WEIGHT: 'WEIGHT' };
exports.LEVEL_LABEL = { LEVEL1: '一级（重点）', LEVEL2: '二级', LEVEL3: '三级（常规）' };
const m = (code, name, freq, group = 'ITEM') => ({ code, name, subject: 'MOTHER', group, freq });
const b = (code, name, freq, group = 'ITEM') => ({ code, name, subject: 'BABY', group, freq });
const EDU = [
    m('EDU_ADMISSION', '入所宣教', { kind: 'ONCE' }, 'EDU'),
    m('EDU_DIET', '产妇饮食指导', { kind: 'ONCE' }, 'EDU'),
    b('EDU_CHOKING', '新生儿呛奶急救', { kind: 'ONCE' }, 'EDU'),
    b('EDU_BREASTFEED', '母乳喂养及拍嗝', { kind: 'ONCE' }, 'EDU'),
    b('EDU_HOLD', '新生儿抱姿', { kind: 'ONCE' }, 'EDU'),
    b('EDU_DIAPER', '更换纸尿裤', { kind: 'ONCE' }, 'EDU'),
    b('EDU_GAS', '新生儿排气操', { kind: 'ONCE' }, 'EDU'),
    b('EDU_PASSIVE', '新生儿被动操', { kind: 'ONCE' }, 'EDU'),
    b('EDU_BATH', '新生儿洗澡', { kind: 'ONCE' }, 'EDU'),
    b('EDU_TOUCH', '新生儿抚触', { kind: 'ONCE' }, 'EDU'),
    m('EDU_DISCHARGE', '出所健康指导', { kind: 'ONCE' }, 'EDU'),
];
const L3 = [
    m('BP', '产妇血压', { kind: 'DAILY', days: 3 }),
    m('WEIGHT', '产妇体重', { kind: 'WEEKLY' }),
    m('PERINEAL', '会阴护理', { kind: 'AS_NEEDED' }),
    m('PHYSIO', '理疗护理（红光治疗仪）', { kind: 'AS_NEEDED' }),
    m('UTERUS_MASSAGE', '按摩子宫护理', { kind: 'AS_NEEDED' }),
    m('ROUND_NEWBORN', '新生儿查房（儿科专家）', { kind: 'WEEKLY' }),
    m('ROUND_OB', '产科查房', { kind: 'WEEKLY' }),
    m('ROUND_NUTRITION', '营养师查房', { kind: 'WEEKLY' }),
    m('ROUND_RECOVERY', '产康查房', { kind: 'WEEKLY' }),
    m('HAIR_WASH', '中药水洗头', { kind: 'WEEKLY', afterDay: 14 }),
    m('FOOT_SOAK', '中药水泡脚', { kind: 'WEEKLY', afterDay: 10 }),
    b('BABY_BATH', '宝宝洗澡', { kind: 'EVERY_N_DAYS', n: 2 }),
    b('BABY_SWIM', '宝宝游泳（脐带脱落后）', { kind: 'WEEKLY' }),
];
const override = (list, patch) => list.map((s) => (patch[s.code] ? { ...s, freq: patch[s.code] } : s));
const L2 = override(L3, {
    BP: { kind: 'DAILY', days: 7 },
    WEIGHT: { kind: 'WEEKLY', perWeek: 2 },
    PERINEAL: { kind: 'DAILY', days: 14 },
    UTERUS_MASSAGE: { kind: 'DAILY', days: 7 },
    BABY_BATH: { kind: 'DAILY' },
});
const L1 = override(L2, {
    BP: { kind: 'DAILY_TIMES', times: 3, days: 3 },
    WEIGHT: { kind: 'WEEKLY', perWeek: 3 },
    ROUND_NEWBORN: { kind: 'WEEKLY', perWeek: 2 },
    ROUND_OB: { kind: 'WEEKLY', perWeek: 2 },
});
exports.LEVEL_STANDARDS = {
    LEVEL3: { label: exports.LEVEL_LABEL.LEVEL3, desc: '身体情况稳定的常规护理，频次按《会所入住宣教》执行', services: [...L3, ...EDU] },
    LEVEL2: { label: exports.LEVEL_LABEL.LEVEL2, desc: '有一定问题需要加密观察（草案，待护理主任审定）', services: [...L2, ...EDU] },
    LEVEL1: { label: exports.LEVEL_LABEL.LEVEL1, desc: '存在较重问题、重点监护（草案，待护理主任审定）', services: [...L1, ...EDU] },
};
function freqText(f) {
    switch (f.kind) {
        case 'DAILY':
            return f.days ? `入所前 ${f.days} 天每天 1 次` : '每天 1 次';
        case 'DAILY_TIMES':
            return `入所前 ${f.days} 天每天 ${f.times} 次`;
        case 'EVERY_N_DAYS':
            return `每 ${f.n} 天 1 次`;
        case 'WEEKLY':
            return `${f.afterDay ? `入所第 ${f.afterDay} 天后` : ''}每周 ${f.perWeek ?? 1} 次`;
        case 'ONCE':
            return '入住期间 1 次（客户签字）';
        case 'AS_NEEDED':
            return '按恢复情况安排';
    }
}
function expectedCount(f, stayDay) {
    if (stayDay < 1)
        return 0;
    switch (f.kind) {
        case 'DAILY':
            return Math.min(stayDay, f.days ?? stayDay);
        case 'DAILY_TIMES':
            return Math.min(stayDay, f.days) * f.times;
        case 'EVERY_N_DAYS':
            return Math.floor((stayDay - 1) / f.n) + 1;
        case 'WEEKLY': {
            const per = f.perWeek ?? 1;
            const d = f.afterDay ?? 0;
            return stayDay <= d ? 0 : (Math.floor((stayDay - d - 1) / 7) + 1) * per;
        }
        case 'ONCE':
            return 1;
        case 'AS_NEEDED':
            return null;
    }
}
const allServiceCodes = () => new Set(Object.values(exports.LEVEL_STANDARDS).flatMap((l) => l.services.map((s) => s.code)));
exports.allServiceCodes = allServiceCodes;
//# sourceMappingURL=care-standards.js.map