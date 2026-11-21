"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextEmployeeNo = nextEmployeeNo;
exports.normalizeMobile = normalizeMobile;
exports.assertEmployeeNoForStore = assertEmployeeNoForStore;
const common_1 = require("@nestjs/common");
async function nextEmployeeNo(prisma, tenantId, alsoTaken = [], storeId) {
    const prefix = storeId ? (await prisma.store.findUnique({ where: { id: storeId }, select: { employeeNoPrefix: true } }))?.employeeNoPrefix : null;
    if (prefix) {
        const used = await prisma.employeeProfile.findMany({ where: { tenantId, activeEmployeeNo: { startsWith: prefix } }, select: { activeEmployeeNo: true } });
        const taken = new Set([...used.map((r) => r.activeEmployeeNo), ...alsoTaken]);
        const nums = [...taken].filter((n) => n.startsWith(prefix) && /^\d+$/.test(n));
        const width = Math.max(prefix.length + 2, ...nums.map((n) => n.length));
        let n = nums.length > 0 ? Math.max(...nums.map(Number)) + 1 : Number(prefix + '0'.repeat(width - prefix.length - 1) + '1');
        while (taken.has(String(n).padStart(width, '0')))
            n += 1;
        return String(n).padStart(width, '0');
    }
    const rows = await prisma.employeeProfile.findMany({ where: { tenantId, activeEmployeeNo: { not: null } }, select: { activeEmployeeNo: true } });
    const taken = new Set([...rows.map((r) => r.activeEmployeeNo), ...alsoTaken]);
    const nums = [...taken].filter((n) => /^\d+$/.test(n));
    const allNumeric = nums.length === taken.size;
    const width = Math.max(3, ...nums.map((n) => n.length));
    let n = Math.max(0, ...nums.map(Number)) + 1;
    const make = (i) => (allNumeric ? String(i).padStart(width, '0') : `E${String(i).padStart(3, '0')}`);
    while (taken.has(make(n)))
        n += 1;
    return make(n);
}
function normalizeMobile(raw) {
    if (raw === null || raw === undefined)
        return null;
    const digits = String(raw).replace(/[\s-]/g, '').replace(/^\+?86/, '');
    return /^1[3-9]\d{9}$/.test(digits) ? digits : null;
}
async function assertEmployeeNoForStore(prisma, storeId, employeeNo) {
    if (!storeId)
        return;
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { name: true, employeeNoPrefix: true } });
    if (store?.employeeNoPrefix && !employeeNo.startsWith(store.employeeNoPrefix)) {
        throw new common_1.BadRequestException(`${store.name}的员工工号必须以 ${store.employeeNoPrefix} 开头（当前：${employeeNo}）`);
    }
}
//# sourceMappingURL=employee-no.util.js.map