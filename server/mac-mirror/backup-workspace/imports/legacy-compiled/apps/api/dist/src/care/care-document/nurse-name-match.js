"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NURSE_FIELD_KEYS = void 0;
exports.editDistance = editDistance;
exports.matchNurseName = matchNurseName;
exports.applyNurseRoster = applyNurseRoster;
exports.withRosterHint = withRosterHint;
exports.NURSE_FIELD_KEYS = ['dayNurseName', 'nightNurseName', 'nurseName', 'responsibleNurseName', 'assessorName'];
const clean = (s) => s.replace(/[\s·.。、,，:：()（）\-_*/\\|]/g, '');
function editDistance(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
        let prev = dp[0];
        dp[0] = i;
        for (let j = 1; j <= n; j++) {
            const tmp = dp[j];
            dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
            prev = tmp;
        }
    }
    return dp[n];
}
function matchNurseName(raw, roster) {
    const none = { value: null, level: null, message: null };
    if (typeof raw !== 'string' || roster.length === 0)
        return none;
    const r = clean(raw);
    if (!r)
        return none;
    if (roster.includes(r))
        return r === raw ? none : { value: r, level: null, message: null };
    const scored = roster.map((n) => ({ n, d: editDistance(r, n) })).sort((x, y) => x.d - y.d);
    const best = scored[0];
    if (best.d > 1)
        return { value: null, level: 'warn', message: `手写“${raw}”对不上护理部任何一位员工，请核对` };
    const ties = scored.filter((x) => x.d === best.d);
    if (ties.length === 1)
        return { value: best.n, level: 'warn', message: `手写“${raw}”已按护理部员工核对为“${best.n}”，请确认` };
    return { value: null, level: 'warn', message: `手写“${raw}”可能是${ties.slice(0, 4).map((x) => `“${x.n}”`).join('或')}，请核对` };
}
function applyNurseRoster(data, roster) {
    const out = [];
    const handle = (holder, key, path) => {
        const fix = matchNurseName(holder[key], roster);
        if (fix.value !== null)
            holder[key] = fix.value;
        if (fix.level && fix.message)
            out.push({ field: path, level: fix.level, message: fix.message });
    };
    for (const [k, v] of Object.entries(data)) {
        if (exports.NURSE_FIELD_KEYS.includes(k) && typeof v === 'string')
            handle(data, k, k);
        else if (Array.isArray(v)) {
            v.forEach((row, i) => {
                if (row && typeof row === 'object')
                    for (const key of exports.NURSE_FIELD_KEYS)
                        if (typeof row[key] === 'string')
                            handle(row, key, `${k}.${i}.${key}`);
            });
        }
    }
    return out;
}
function withRosterHint(fields, roster) {
    if (roster.length === 0)
        return fields;
    const hint = `签字人只可能是这些护理部员工之一：${roster.join('、')}；按字形最接近的选，实在认不出再原样抄写`;
    const patch = (f) => (exports.NURSE_FIELD_KEYS.includes(f.key) ? { ...f, aiHint: [f.aiHint, hint].filter(Boolean).join('；') } : f);
    return fields.map((f) => {
        const p = patch(f);
        return Array.isArray(f.columns) ? { ...p, columns: f.columns.map(patch) } : p;
    });
}
//# sourceMappingURL=nurse-name-match.js.map