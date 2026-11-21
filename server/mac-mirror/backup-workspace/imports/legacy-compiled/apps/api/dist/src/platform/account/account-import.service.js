"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountImportService = exports.DEFAULT_PASSWORD = void 0;
exports.parseSheetDate = parseSheetDate;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const data_scope_service_1 = require("../../common/scope/data-scope.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const id_card_util_1 = require("../../common/utils/id-card.util");
const employee_no_util_1 = require("../../common/utils/employee-no.util");
const xlsx_reader_1 = require("../../common/utils/xlsx-reader");
const account_service_1 = require("./account.service");
exports.DEFAULT_PASSWORD = 'banyuexuan';
const ALIASES = {
    employeeNo: ['员工工号', '工号', '员工编号', '编号'],
    storeName: ['门店', '所属门店'],
    teamName: ['班组', '组别'],
    username: ['用户名', '账号', '登录名'],
    name: ['姓名', '员工姓名'],
    departmentName: ['部门'],
    positionName: ['职位', '职务', '岗位'],
    hireDate: ['入职日期', '入职时间'],
    phone: ['手机号', '手机号码', '联系电话', '手机', '电话'],
    contractType: ['合同类型'],
    socialInsurance: ['社保缴纳', '社保'],
    idCardNo: ['身份证号码', '身份证号', '身份证'],
    bankAccountNo: ['工资卡账号', '工资卡', '银行卡号', '银行卡'],
    bankName: ['开户行', '开户银行'],
    remark: ['备注'],
};
const CONTRACT = { 劳动合同: 'LABOR', 试用期合同: 'PROBATION', 劳务合同: 'SERVICE', 待签: 'PENDING_SIGN', '用工协议（超龄）': 'OVERAGE', '用工协议(超龄)': 'OVERAGE', 用工协议: 'OVERAGE' };
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const text = (v) => {
    if (v === null || v === undefined)
        return null;
    const t = clean(v);
    return t || null;
};
function parseSheetDate(v) {
    if (v === null || v === undefined || v === '')
        return null;
    if (typeof v === 'number' && v > 20000 && v < 80000) {
        return new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000).toISOString().slice(0, 10);
    }
    const m = /(\d{4})\s*[.\-/年]\s*(\d{1,2})\s*[.\-/月]\s*(\d{1,2})/.exec(String(v));
    if (!m)
        return null;
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    return d.getUTCMonth() === Number(m[2]) - 1 ? d.toISOString().slice(0, 10) : null;
}
function cellEmployeeNo(v, width) {
    if (v === null || v === undefined || v === '')
        return null;
    if (typeof v === 'number')
        return String(Math.round(v)).padStart(width, '0');
    return clean(v) || null;
}
let AccountImportService = class AccountImportService {
    prisma;
    accountService;
    auditLogService;
    dataScope;
    ctx;
    constructor(prisma, accountService, auditLogService, dataScope, ctx) {
        this.prisma = prisma;
        this.accountService = accountService;
        this.auditLogService = auditLogService;
        this.dataScope = dataScope;
        this.ctx = ctx;
    }
    get tenantId() {
        return this.ctx.tenantId;
    }
    async preview(file) {
        let sheets;
        try {
            sheets = (0, xlsx_reader_1.readXlsx)(file);
        }
        catch (e) {
            throw new common_1.BadRequestException(`读取不了这个文件：${e.message}。请上传 Excel（.xlsx）文件`);
        }
        for (const sheet of sheets) {
            const headerIdx = sheet.rows.slice(0, 20).findIndex((r) => r.some((c) => ALIASES.name.includes(clean(c))) && r.some((c) => ALIASES.phone.includes(clean(c))));
            if (headerIdx < 0)
                continue;
            const header = sheet.rows[headerIdx].map((c) => clean(c));
            const col = (k) => header.findIndex((h) => h && ALIASES[k].includes(h));
            const idx = Object.fromEntries(Object.keys(ALIASES).map((k) => [k, col(k)]));
            const used = new Set(Object.values(idx).filter((i) => i >= 0));
            const ignoredColumns = header.filter((h, i) => h && !used.has(i));
            const noCells = idx.employeeNo >= 0 ? sheet.rows.slice(headerIdx + 1).map((r) => r?.[idx.employeeNo]).filter((v) => typeof v === 'string') : [];
            const width = Math.max(3, ...noCells.map((v) => String(v).length));
            const parsed = [];
            for (let r = headerIdx + 1; r < sheet.rows.length; r++) {
                const row = sheet.rows[r] ?? [];
                const get = (k) => (idx[k] >= 0 ? row[idx[k]] : null);
                const name = text(get('name'));
                const phoneRaw = text(get('phone'));
                if (!name && !phoneRaw)
                    continue;
                parsed.push({
                    rowNo: r + 1,
                    employeeNo: cellEmployeeNo(get('employeeNo'), width),
                    name: name ?? '',
                    phone: phoneRaw ? ((0, employee_no_util_1.normalizeMobile)(phoneRaw) ?? phoneRaw) : null,
                    storeName: text(get('storeName')),
                    teamName: text(get('teamName')),
                    departmentName: text(get('departmentName')),
                    positionName: text(get('positionName')),
                    hireDate: parseSheetDate(get('hireDate')),
                    contractType: text(get('contractType')),
                    socialInsurance: text(get('socialInsurance')),
                    idCardNo: text(get('idCardNo')),
                    bankAccountNo: text(get('bankAccountNo'))?.replace(/\s/g, '') ?? null,
                    bankName: text(get('bankName')),
                    remark: text(get('remark')),
                });
            }
            return { sheetName: sheet.name, headerRow: headerIdx + 1, ignoredColumns, rows: await this.check(parsed) };
        }
        throw new common_1.BadRequestException('没有在表里找到“姓名”和“手机号”这两列，请确认表头里有这两列');
    }
    async check(rows, defaultStoreId) {
        const [stores, departments, positions, accounts, profiles] = await Promise.all([
            this.prisma.store.findMany({ where: { tenantId: this.tenantId }, select: { id: true, name: true, employeeNoPrefix: true } }),
            this.prisma.department.findMany({ where: { tenantId: this.tenantId }, select: { name: true, storeId: true } }),
            this.prisma.position.findMany({ where: { tenantId: this.tenantId }, select: { name: true } }),
            this.prisma.account.findMany({ where: { tenantId: this.tenantId, phone: { not: null } }, select: { id: true, phone: true, realName: true, employeeProfile: { select: { id: true, activeEmployeeNo: true } } } }),
            this.prisma.employeeProfile.findMany({ where: { tenantId: this.tenantId, activeEmployeeNo: { not: null } }, select: { activeEmployeeNo: true, account: { select: { realName: true, phone: true } } } }),
        ]);
        const phoneOwner = new Map(accounts.map((a) => [a.phone, a]));
        const noOwner = new Map(profiles.map((p) => [p.activeEmployeeNo, p.account]));
        const sheetNoByPhone = new Map();
        for (const r of rows) {
            const ph = r.phone ? (0, employee_no_util_1.normalizeMobile)(r.phone) : null;
            if (ph && r.employeeNo && phoneOwner.has(ph))
                sheetNoByPhone.set(ph, r.employeeNo);
        }
        const sheetNos = new Set(rows.map((r) => r.employeeNo).filter((x) => !!x));
        const assigned = new Set();
        const seenPhone = new Map();
        const seenNo = new Map();
        const out = [];
        for (const r of rows) {
            const issues = [];
            const err = (t) => issues.push({ level: 'error', text: t });
            const warn = (t) => issues.push({ level: 'warn', text: t });
            if (!r.name)
                err('缺姓名');
            const phone = r.phone ? (0, employee_no_util_1.normalizeMobile)(r.phone) : null;
            if (!r.phone)
                err('缺手机号（手机号是登录名，必须填）');
            else if (!phone)
                err(`手机号“${r.phone}”不是 11 位手机号`);
            else {
                if (seenPhone.has(phone))
                    err(`和表里第 ${seenPhone.get(phone)} 行手机号重复`);
                else
                    seenPhone.set(phone, r.rowNo);
            }
            const existing = phone ? phoneOwner.get(phone) : undefined;
            const existingNo = existing?.employeeProfile?.activeEmployeeNo ?? null;
            let willRenumber = false;
            let employeeNo = r.employeeNo;
            let suggested = false;
            const store = r.storeName ? (stores.find((s) => s.name === r.storeName) ?? stores.find((s) => s.name.includes(r.storeName) || r.storeName.includes(s.name))) : null;
            const rowStore = store ?? stores.find((s) => s.id === defaultStoreId) ?? null;
            if (existing) {
                if (!existing.employeeProfile)
                    warn(`已有账号「${existing.realName}」，但没有员工档案，不处理`);
                else if (employeeNo && employeeNo !== existingNo) {
                    willRenumber = true;
                    warn(`已有账号「${existing.realName}」，不新建；工号将由 ${existingNo} 改为 ${employeeNo}`);
                }
                else
                    warn(`已有账号「${existing.realName}」，不新建、不改动`);
            }
            if (employeeNo && (!existing || willRenumber)) {
                const holder = noOwner.get(employeeNo);
                if (holder && holder.phone !== phone && !(holder.phone && sheetNoByPhone.has(holder.phone) && sheetNoByPhone.get(holder.phone) !== employeeNo)) {
                    err(`工号 ${employeeNo} 已经分配给「${holder.realName}」`);
                }
                if (seenNo.has(employeeNo))
                    err(`和表里第 ${seenNo.get(employeeNo)} 行工号重复`);
                else
                    seenNo.set(employeeNo, r.rowNo);
                if (rowStore?.employeeNoPrefix && !employeeNo.startsWith(rowStore.employeeNoPrefix))
                    err(`${rowStore.name}的工号必须以 ${rowStore.employeeNoPrefix} 开头`);
            }
            else if (!employeeNo) {
                employeeNo = await (0, employee_no_util_1.nextEmployeeNo)(this.prisma, this.tenantId, [...sheetNos, ...assigned], rowStore?.id);
                assigned.add(employeeNo);
                suggested = true;
            }
            if (r.storeName && !store)
                warn(`找不到门店“${r.storeName}”，将使用你在上面选的门店`);
            const dept = r.departmentName ? departments.some((d) => d.name === r.departmentName && (!store || d.storeId === store.id || !d.storeId)) : true;
            const pos = r.positionName ? positions.some((p) => p.name === r.positionName) : true;
            if (!r.hireDate)
                warn('没有写入职日期，将按今天算');
            if (r.idCardNo) {
                const c = (0, id_card_util_1.checkIdCard)(r.idCardNo);
                if (!c.valid)
                    warn(`身份证号不正确（${c.reason}），员工档案里不会写入这一项`);
            }
            const resigned = /离职/.test(r.remark ?? '');
            if (resigned)
                warn('备注里写了“离职”，默认不开通账号（需要的话手动勾选）');
            out.push({ ...r, phone: phone ?? r.phone, employeeNo, storeId: store?.id ?? null, employeeNoSuggested: suggested, existingAccountId: existing?.id ?? null, existingNo, willRenumber, newDepartment: !dept, newPosition: !pos, resigned, issues });
        }
        return out;
    }
    async commit(input) {
        const store = await this.prisma.store.findFirst({ where: { id: input.storeId, tenantId: this.tenantId } });
        if (!store)
            throw new common_1.BadRequestException('请选择要开通到哪个门店');
        await this.dataScope.assertStoreAccessible(this.ctx, store.id);
        if (!Array.isArray(input.rows) || input.rows.length === 0)
            throw new common_1.BadRequestException('没有要开通的员工');
        if (input.rows.length > 300)
            throw new common_1.BadRequestException('一次最多开通 300 人');
        if (input.roleId && !(await this.prisma.role.findFirst({ where: { id: input.roleId, tenantId: this.tenantId }, select: { id: true } })))
            throw new common_1.BadRequestException('所选角色不存在');
        const checked = await this.check(input.rows, store.id);
        const results = [];
        const deptCache = new Map();
        const posCache = new Map();
        const dept = async (name, storeId) => {
            if (!name)
                return undefined;
            const key = `${storeId}|${name}`;
            if (deptCache.has(key))
                return deptCache.get(key);
            const found = await this.prisma.department.findFirst({ where: { tenantId: this.tenantId, name, OR: [{ storeId }, { storeId: null }] } });
            let id = found?.id;
            if (!id && input.createMissing) {
                id = (await this.prisma.department.create({ data: { tenantId: this.tenantId, storeId, code: (0, business_no_util_1.generateBusinessNo)('DP'), name, createdBy: this.ctx.accountId } })).id;
            }
            if (id)
                deptCache.set(key, id);
            return id;
        };
        const position = async (name) => {
            if (!name)
                return undefined;
            if (posCache.has(name))
                return posCache.get(name);
            const found = await this.prisma.position.findFirst({ where: { tenantId: this.tenantId, name } });
            let id = found?.id;
            if (!id && input.createMissing)
                id = (await this.prisma.position.create({ data: { tenantId: this.tenantId, code: (0, business_no_util_1.generateBusinessNo)('PS'), name, createdBy: this.ctx.accountId } })).id;
            if (id)
                posCache.set(name, id);
            return id;
        };
        const canRenumber = await this.ctx.hasPermission('hr.employee-profile.change-no');
        const toRenumber = [];
        for (const r of checked) {
            if (!r.existingAccountId)
                continue;
            const errors = r.issues.filter((i) => i.level === 'error');
            if (errors.length > 0)
                results.push({ rowNo: r.rowNo, name: r.name, ok: false, error: errors.map((e) => e.text).join('；') });
            else if (r.willRenumber && !canRenumber)
                results.push({ rowNo: r.rowNo, name: r.name, ok: false, error: '修改已有员工的工号需要“修改员工工号”权限' });
            else if (r.willRenumber)
                toRenumber.push(r);
            else
                results.push({ rowNo: r.rowNo, name: r.name, ok: true, action: 'skipped', employeeNo: r.existingNo ?? undefined });
        }
        if (toRenumber.length > 0) {
            try {
                await this.prisma.$transaction(async (tx) => {
                    const ids = toRenumber.map((r) => r.existingAccountId);
                    await tx.employeeProfile.updateMany({ where: { accountId: { in: ids } }, data: { activeEmployeeNo: null } });
                    for (const r of toRenumber) {
                        await tx.employeeProfile.update({ where: { accountId: r.existingAccountId }, data: { employeeNo: r.employeeNo, activeEmployeeNo: r.employeeNo, version: { increment: 1 } } });
                        await this.auditLogService.record({
                            action: 'UPDATE',
                            entityType: 'EmployeeProfile',
                            entityId: r.existingAccountId,
                            remark: `批量导入：「${r.name}」工号 ${r.existingNo} → ${r.employeeNo}`,
                            tenantId: this.tenantId,
                            accountId: this.ctx.accountId,
                            ip: this.ctx.ip,
                            userAgent: this.ctx.userAgent,
                            requestId: this.ctx.requestId,
                        });
                    }
                });
                for (const r of toRenumber)
                    results.push({ rowNo: r.rowNo, name: r.name, ok: true, action: 'renumbered', employeeNo: r.employeeNo });
            }
            catch (e) {
                for (const r of toRenumber)
                    results.push({ rowNo: r.rowNo, name: r.name, ok: false, error: `改工号失败：${e.message.slice(0, 120)}` });
            }
        }
        for (const r of checked) {
            if (r.existingAccountId)
                continue;
            const errors = r.issues.filter((i) => i.level === 'error');
            if (errors.length > 0) {
                results.push({ rowNo: r.rowNo, name: r.name, ok: false, error: errors.map((e) => e.text).join('；') });
                continue;
            }
            try {
                const storeId = r.storeId ?? store.id;
                await this.dataScope.assertStoreAccessible(this.ctx, storeId);
                const team = r.teamName ? await this.prisma.team.findFirst({ where: { tenantId: this.tenantId, name: r.teamName } }) : null;
                const account = await this.accountService.create({
                    username: r.phone,
                    realName: r.name,
                    password: exports.DEFAULT_PASSWORD,
                    phone: r.phone,
                    storeId,
                    departmentId: await dept(r.departmentName, storeId),
                    teamId: team?.id,
                    positionId: await position(r.positionName),
                    employeeNo: r.employeeNo,
                    hireDate: new Date(`${r.hireDate ?? new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10)}T00:00:00.000Z`).toISOString(),
                });
                if (input.importProfileDetails)
                    await this.writeProfileDetails(account.id, r);
                if (input.roleId)
                    await this.accountService.assignRole(account.id, input.roleId, 'STORE', [storeId]);
                results.push({ rowNo: r.rowNo, name: r.name, ok: true, action: 'created', employeeNo: r.employeeNo });
            }
            catch (e) {
                results.push({ rowNo: r.rowNo, name: r.name, ok: false, error: e.response?.message ?? e.message });
            }
        }
        const created = results.filter((x) => x.ok && x.action === 'created').length;
        const renumbered = results.filter((x) => x.action === 'renumbered').length;
        const skipped = results.filter((x) => x.action === 'skipped').length;
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'Account',
            entityId: 'IMPORT',
            afterData: { created, renumbered, skipped, failed: results.filter((x) => !x.ok).length, names: results.filter((x) => x.action === 'created').map((x) => x.name) },
            remark: `员工信息表批量开通账号：新开通 ${created}，改工号 ${renumbered}，已有未动 ${skipped}，失败 ${results.filter((x) => !x.ok).length}`,
            tenantId: this.tenantId,
            storeId: store.id,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
        return { created, renumbered, skipped, failed: results.filter((x) => !x.ok), results };
    }
    async writeProfileDetails(accountId, r) {
        const data = {};
        if (r.contractType && CONTRACT[r.contractType])
            data.contractType = CONTRACT[r.contractType];
        if (r.socialInsurance)
            data.socialInsurance = (r.socialInsurance === '参保' ? 'ENROLLED' : 'NOT_ENROLLED');
        if (r.idCardNo) {
            const c = (0, id_card_util_1.checkIdCard)(r.idCardNo);
            if (c.valid && !(await this.prisma.employeeProfile.findFirst({ where: { tenantId: this.tenantId, idCardNo: c.normalized } }))) {
                data.idCardNo = c.normalized;
                data.gender = c.gender;
                data.birthDate = new Date(`${c.birthday}T00:00:00.000Z`);
            }
        }
        if (r.bankAccountNo && /^\d{6,32}$/.test(r.bankAccountNo))
            data.bankAccountNo = r.bankAccountNo;
        if (r.bankName)
            data.bankName = r.bankName.slice(0, 100);
        if (r.remark)
            data.remark = r.remark;
        if (Object.keys(data).length === 0)
            return;
        await this.prisma.employeeProfile.update({ where: { accountId }, data });
    }
};
exports.AccountImportService = AccountImportService;
exports.AccountImportService = AccountImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        account_service_1.AccountService,
        audit_log_service_1.AuditLogService,
        data_scope_service_1.DataScopeService,
        request_context_service_1.RequestContextService])
], AccountImportService);
//# sourceMappingURL=account-import.service.js.map