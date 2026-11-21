"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemMatchesKeyword = itemMatchesKeyword;
const pinyin_pro_1 = require("pinyin-pro");
const cache = new Map();
function py(text) {
    let hit = cache.get(text);
    if (!hit) {
        hit = {
            full: (0, pinyin_pro_1.pinyin)(text, { toneType: 'none', type: 'array', nonZh: 'removed' }).join(''),
            initials: (0, pinyin_pro_1.pinyin)(text, { pattern: 'first', toneType: 'none', type: 'array', nonZh: 'removed' }).join(''),
        };
        cache.set(text, hit);
    }
    return hit;
}
function itemMatchesKeyword(item, keyword) {
    const words = (keyword ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0)
        return true;
    const text = [item.name, item.spec, item.brand, item.code, item.category].filter(Boolean).join(' ').toLowerCase();
    const p = py(item.name);
    return words.every((w) => text.includes(w) || p.full.includes(w) || p.initials.includes(w));
}
//# sourceMappingURL=item-match.js.map