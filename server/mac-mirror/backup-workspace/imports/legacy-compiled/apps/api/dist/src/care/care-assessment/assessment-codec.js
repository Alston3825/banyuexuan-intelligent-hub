"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDbData = toDbData;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const assessment_specs_1 = require("./assessment-specs");
const MAX_TEXT = 200;
const MAX_LONGTEXT = 5000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}/;
const isBlank = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
function convert(f, v) {
    if (v === undefined)
        return undefined;
    if (isBlank(v))
        return f.kind === 'multi' ? client_1.Prisma.DbNull : null;
    switch (f.kind) {
        case 'text':
        case 'longtext': {
            const s = String(v).trim();
            const max = f.kind === 'text' ? MAX_TEXT : MAX_LONGTEXT;
            if (s.length > max)
                throw new Error(`${f.label}太长（最多 ${max} 个字）`);
            return s || null;
        }
        case 'int': {
            const n = Number(v);
            if (!Number.isFinite(n))
                throw new Error(`${f.label}必须是数字`);
            return Math.round(n);
        }
        case 'decimal': {
            const n = Number(v);
            if (!Number.isFinite(n))
                throw new Error(`${f.label}必须是数字`);
            return n;
        }
        case 'date': {
            const s = String(v);
            if (!DATE_RE.test(s))
                throw new Error(`${f.label}日期格式不正确（应为 YYYY-MM-DD）`);
            const d = new Date(`${s.slice(0, 10)}T00:00:00.000Z`);
            if (Number.isNaN(d.getTime()))
                throw new Error(`${f.label}不是有效日期`);
            return d;
        }
        case 'single': {
            const s = String(v);
            if (!f.options.some((o) => o.value === s))
                throw new Error(`${f.label}的取值「${s}」不在可选项里`);
            return s;
        }
        case 'multi': {
            const arr = Array.isArray(v) ? v.map(String) : [String(v)];
            const bad = arr.find((x) => !f.options.some((o) => o.value === x));
            if (bad)
                throw new Error(`${f.label}的取值「${bad}」不在可选项里`);
            return [...new Set(arr)];
        }
    }
}
function toDbData(spec, values) {
    const data = {};
    const errors = [];
    for (const f of (0, assessment_specs_1.allFields)(spec)) {
        try {
            const out = convert(f, values[f.key]);
            if (out !== undefined)
                data[f.key] = out;
        }
        catch (e) {
            errors.push(e.message);
        }
    }
    if (errors.length > 0)
        throw new common_1.BadRequestException(errors.join('；'));
    return data;
}
//# sourceMappingURL=assessment-codec.js.map