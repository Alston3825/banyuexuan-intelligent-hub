"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TABLE_LABELS = exports.TreeCollector = void 0;
exports.serializeSnapshot = serializeSnapshot;
exports.parseSnapshot = parseSnapshot;
exports.deleteSnapshot = deleteSnapshot;
exports.restoreSnapshot = restoreSnapshot;
exports.summarizeSnapshot = summarizeSnapshot;
const client_1 = require("@prisma/client");
const CHUNK = 400;
const q = (name) => '`' + name.replace(/`/g, '') + '`';
const placeholders = (n) => Array.from({ length: n }, () => '?').join(',');
function chunks(arr, size = CHUNK) {
    const out = [];
    for (let i = 0; i < arr.length; i += size)
        out.push(arr.slice(i, i + size));
    return out;
}
class TreeCollector {
    db;
    referrerCache = new Map();
    pkCache = new Map();
    seen = new Map();
    groups = [];
    nulls = [];
    keep;
    constructor(db, opts = {}) {
        this.db = db;
        this.keep = new Set(opts.keepNullables ?? []);
    }
    idsOf(table) {
        return [...(this.seen.get(table) ?? [])];
    }
    async collect(table, ids, depth = 0) {
        const fresh = ids.filter((i) => !this.seen.get(table)?.has(i));
        if (fresh.length === 0)
            return;
        if (!this.seen.has(table))
            this.seen.set(table, new Set());
        for (const i of fresh)
            this.seen.get(table).add(i);
        await this.assertHasIdPk(table);
        for (const ref of await this.referrers(table)) {
            const rows = [];
            for (const part of chunks(fresh)) {
                rows.push(...(await this.db.$queryRawUnsafe(`SELECT id FROM ${q(ref.table)} WHERE ${q(ref.column)} IN (${placeholders(part.length)})`, ...part)));
            }
            if (rows.length === 0)
                continue;
            const asNull = ref.nullable && (depth > 0 || this.keep.has(`${ref.table}.${ref.column}`));
            if (asNull) {
                const items = [];
                for (const part of chunks(rows.map((r) => r.id))) {
                    const cur = await this.db.$queryRawUnsafe(`SELECT id, ${q(ref.column)} AS v FROM ${q(ref.table)} WHERE id IN (${placeholders(part.length)})`, ...part);
                    for (const c of cur)
                        items.push({ id: String(c.id), value: c.v });
                }
                this.nulls.push({ table: ref.table, column: ref.column, items });
            }
            else {
                await this.collect(ref.table, rows.map((r) => r.id), depth + 1);
            }
        }
        const data = [];
        for (const part of chunks(fresh)) {
            data.push(...(await this.db.$queryRawUnsafe(`SELECT * FROM ${q(table)} WHERE id IN (${placeholders(part.length)})`, ...part)));
        }
        if (data.length > 0)
            this.groups.push({ table, rows: data });
    }
    async collectWhere(table, where, params) {
        const rows = await this.db.$queryRawUnsafe(`SELECT id FROM ${q(table)} WHERE ${where}`, ...params);
        await this.collect(table, rows.map((r) => r.id), 0);
    }
    async collectByIdColumn(table, column, ids, extraWhere = '', extraParams = []) {
        for (const part of chunks(ids)) {
            await this.collectWhere(table, `${q(column)} IN (${placeholders(part.length)})${extraWhere ? ' AND ' + extraWhere : ''}`, [...part, ...extraParams]);
        }
    }
    snapshot() {
        return { version: 1, groups: this.groups, nulls: this.nulls };
    }
    async assertHasIdPk(table) {
        const cached = this.pkCache.get(table);
        if (cached === false)
            throw new Error(`表 ${table} 没有单列 id 主键，回收站暂不支持`);
        if (cached)
            return;
        const cols = await this.db.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'`, table);
        const pk = await this.db.$queryRawUnsafe(`SELECT COLUMN_NAME AS c FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'`, table);
        const ok = Number(cols[0]?.n) === 1 && pk[0]?.c === 'id';
        this.pkCache.set(table, ok);
        if (!ok)
            throw new Error(`表 ${table} 没有单列 id 主键，回收站暂不支持`);
    }
    async referrers(table) {
        const hit = this.referrerCache.get(table);
        if (hit)
            return hit;
        const rows = await this.db.$queryRawUnsafe(`SELECT k.TABLE_NAME AS t, k.COLUMN_NAME AS c, col.IS_NULLABLE AS n, k.CONSTRAINT_NAME AS k
       FROM information_schema.KEY_COLUMN_USAGE k
       JOIN information_schema.COLUMNS col ON col.TABLE_SCHEMA = k.TABLE_SCHEMA AND col.TABLE_NAME = k.TABLE_NAME AND col.COLUMN_NAME = k.COLUMN_NAME
       WHERE k.TABLE_SCHEMA = DATABASE() AND k.REFERENCED_TABLE_NAME = ? AND k.REFERENCED_COLUMN_NAME = 'id'`, table);
        const out = rows.map((r) => ({ table: r.t, column: r.c, nullable: r.n === 'YES' }));
        this.referrerCache.set(table, out);
        return out;
    }
}
exports.TreeCollector = TreeCollector;
function serializeSnapshot(snap) {
    return JSON.stringify(snap, function (key, value) {
        const raw = this[key];
        if (raw instanceof Date)
            return { $d: raw.toISOString() };
        if (typeof raw === 'bigint')
            return { $n: raw.toString() };
        if (Buffer.isBuffer(raw))
            return { $b: raw.toString('base64') };
        if (raw instanceof client_1.Prisma.Decimal)
            return { $m: raw.toString() };
        return value;
    });
}
function parseSnapshot(text) {
    return JSON.parse(text, (_k, v) => {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            const keys = Object.keys(v);
            if (keys.length === 1) {
                if (keys[0] === '$d')
                    return new Date(v.$d);
                if (keys[0] === '$n')
                    return BigInt(v.$n);
                if (keys[0] === '$b')
                    return Buffer.from(v.$b, 'base64');
                if (keys[0] === '$m')
                    return v.$m;
            }
        }
        return v;
    });
}
function toParam(v) {
    if (v === undefined)
        return null;
    if (v instanceof Date || Buffer.isBuffer(v) || typeof v === 'bigint')
        return v;
    if (v && typeof v === 'object')
        return JSON.stringify(v);
    return v;
}
async function deleteSnapshot(tx, snap) {
    for (const n of snap.nulls) {
        for (const part of chunks(n.items.map((i) => i.id))) {
            await tx.$executeRawUnsafe(`UPDATE ${q(n.table)} SET ${q(n.column)} = NULL WHERE id IN (${placeholders(part.length)})`, ...part);
        }
    }
    for (const g of snap.groups) {
        for (const part of chunks(g.rows.map((r) => String(r.id)))) {
            await tx.$executeRawUnsafe(`DELETE FROM ${q(g.table)} WHERE id IN (${placeholders(part.length)})`, ...part);
        }
    }
}
async function restoreSnapshot(tx, snap) {
    for (const g of [...snap.groups].reverse()) {
        if (g.rows.length === 0)
            continue;
        const cols = Object.keys(g.rows[0]);
        for (const part of chunks(g.rows, 100)) {
            const one = `(${placeholders(cols.length)})`;
            await tx.$executeRawUnsafe(`INSERT INTO ${q(g.table)} (${cols.map(q).join(',')}) VALUES ${part.map(() => one).join(',')}`, ...part.flatMap((r) => cols.map((c) => toParam(r[c]))));
        }
    }
    for (const n of snap.nulls) {
        for (const it of n.items) {
            await tx.$executeRawUnsafe(`UPDATE ${q(n.table)} SET ${q(n.column)} = ? WHERE id = ? AND ${q(n.column)} IS NULL`, toParam(it.value), it.id).catch(() => undefined);
        }
    }
}
const LABELS = {
    customers: '客户',
    contracts: '合同',
    room_occupancies: '预订/入住记录',
    payments: '收款',
    customer_accounts: '会员账户',
    customer_service_packages: '已购服务包',
    service_appointments: '产康预约',
    diner_profiles: '用膳档案',
    mother_profiles: '母婴档案',
    baby_profiles: '宝宝档案',
    sales_opportunities: '销售机会',
    follow_up_records: '跟进记录',
    care_records: '护理记录',
    care_plans: '护理计划',
    care_documents: '纸质资料',
};
exports.TABLE_LABELS = LABELS;
function summarizeSnapshot(snap, skipTable) {
    const parts = [];
    for (const g of snap.groups) {
        if (g.table === skipTable)
            continue;
        const label = LABELS[g.table];
        if (label)
            parts.push(`${g.rows.length} ${label}`);
    }
    const other = snap.groups.filter((g) => g.table !== skipTable && !LABELS[g.table]).reduce((s, g) => s + g.rows.length, 0);
    if (other > 0)
        parts.push(`${other} 条其他关联记录`);
    return parts.join('、');
}
//# sourceMappingURL=recycle-tree.util.js.map