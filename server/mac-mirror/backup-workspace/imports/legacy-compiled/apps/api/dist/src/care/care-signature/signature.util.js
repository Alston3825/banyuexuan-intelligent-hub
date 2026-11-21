"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskName = exports.randomToken = exports.sha256 = void 0;
exports.assertSignatureImage = assertSignatureImage;
exports.contentHash = contentHash;
exports.signToken = signToken;
exports.verifyToken = verifyToken;
exports.cleanDeviceId = cleanDeviceId;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const PNG_PREFIX = 'data:image/png;base64,';
function assertSignatureImage(data) {
    if (typeof data !== 'string' || !data.startsWith(PNG_PREFIX))
        throw new common_1.BadRequestException('签名图格式不对，请重新签名');
    const b64 = data.slice(PNG_PREFIX.length);
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64))
        throw new common_1.BadRequestException('签名图格式不对，请重新签名');
    const bytes = Buffer.from(b64, 'base64');
    if (bytes.length > 200 * 1024)
        throw new common_1.BadRequestException('签名图太大，请重新签名');
    if (bytes.length < 700 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a')
        throw new common_1.BadRequestException('没有检测到签名笔迹，请在框里签上您的名字');
    return data;
}
const SKIP_KEYS = new Set(['id', 'tenantId', 'storeId', 'motherProfileId', 'dailyRecordId', 'babyDailyId', 'createdBy', 'createdAt', 'updatedAt', 'version', 'documentId']);
function canon(v) {
    if (v === null || v === undefined)
        return undefined;
    if (v instanceof Date)
        return v.toISOString();
    if (Array.isArray(v))
        return v.map(canon);
    if (typeof v === 'object') {
        const out = {};
        for (const k of Object.keys(v).sort()) {
            if (SKIP_KEYS.has(k))
                continue;
            const c = canon(v[k]);
            if (c !== undefined)
                out[k] = c;
        }
        return out;
    }
    return v;
}
function contentHash(record) {
    return (0, crypto_1.createHash)('sha256').update(JSON.stringify(canon(record))).digest('hex');
}
const sha256 = (s) => (0, crypto_1.createHash)('sha256').update(s).digest('hex');
exports.sha256 = sha256;
const randomToken = (bytes = 32) => (0, crypto_1.randomBytes)(bytes).toString('hex');
exports.randomToken = randomToken;
function signToken(payload, secret) {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = (0, crypto_1.createHmac)('sha256', secret).update(body).digest('hex');
    return `${body}.${sig}`;
}
function verifyToken(token, secret) {
    if (typeof token !== 'string')
        return null;
    const [body, sig] = token.split('.');
    if (!body || !sig)
        return null;
    const expected = (0, crypto_1.createHmac)('sha256', secret).update(body).digest('hex');
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !(0, crypto_1.timingSafeEqual)(a, b))
        return null;
    try {
        return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    }
    catch {
        return null;
    }
}
function cleanDeviceId(raw) {
    return typeof raw === 'string' && /^[A-Za-z0-9_-]{16,64}$/.test(raw) ? raw : null;
}
const maskName = (name) => (name.length <= 1 ? '*' : name[0] + '*'.repeat(Math.min(name.length - 1, 3)));
exports.maskName = maskName;
//# sourceMappingURL=signature.util.js.map