"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normName = void 0;
exports.nameSimilarity = nameSimilarity;
const normName = (s) => (s ?? '')
    .toLowerCase()
    .replace(/[\s·.。、,，:：;；()（）【】\[\]\-_*/\\|]/g, '');
exports.normName = normName;
const bigrams = (t) => {
    const out = new Set();
    if (t.length === 1)
        out.add(t);
    for (let i = 0; i < t.length - 1; i++)
        out.add(t.slice(i, i + 2));
    return out;
};
function nameSimilarity(a, b) {
    const x = (0, exports.normName)(a);
    const y = (0, exports.normName)(b);
    if (!x || !y)
        return 0;
    if (x === y)
        return 1;
    const [short, long] = x.length <= y.length ? [x, y] : [y, x];
    if (short.length >= 2 && long.includes(short))
        return 0.85;
    const gx = bigrams(x);
    const gy = bigrams(y);
    let hit = 0;
    for (const g of gx)
        if (gy.has(g))
            hit++;
    return (2 * hit) / (gx.size + gy.size);
}
//# sourceMappingURL=item-similarity.js.map