"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIdCard = checkIdCard;
const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const CHECK_CODES = '10X98765432';
function checkIdCard(raw) {
    const normalized = raw.replace(/\s/g, '').toUpperCase();
    if (!/^\d{17}[\dX]$/.test(normalized)) {
        return { valid: false, normalized, birthday: null, gender: null, reason: '身份证号应为 18 位（最后一位可以是 X）' };
    }
    const y = Number(normalized.slice(6, 10));
    const m = Number(normalized.slice(10, 12));
    const d = Number(normalized.slice(12, 14));
    const date = new Date(Date.UTC(y, m - 1, d));
    const dateOk = date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d && y >= 1900 && date.getTime() <= Date.now();
    if (!dateOk)
        return { valid: false, normalized, birthday: null, gender: null, reason: '身份证里的出生日期不存在' };
    const sum = normalized
        .slice(0, 17)
        .split('')
        .reduce((acc, c, i) => acc + Number(c) * WEIGHTS[i], 0);
    if (CHECK_CODES[sum % 11] !== normalized[17]) {
        return { valid: false, normalized, birthday: null, gender: null, reason: '身份证号校验位不正确，请核对是否输错' };
    }
    return {
        valid: true,
        normalized,
        birthday: `${normalized.slice(6, 10)}-${normalized.slice(10, 12)}-${normalized.slice(12, 14)}`,
        gender: Number(normalized[16]) % 2 === 1 ? 'MALE' : 'FEMALE',
    };
}
//# sourceMappingURL=id-card.util.js.map