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
exports.PurchaseRequestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const data_scope_service_1 = require("../../common/scope/data-scope.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const workflow_engine_service_1 = require("../../workflow/workflow-engine/workflow-engine.service");
const purchase_order_service_1 = require("../purchase-order/purchase-order.service");
const inventory_item_import_service_1 = require("../inventory-item/inventory-item-import.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const DEFINITION_CODE = 'INVENTORY_PURCHASE_REQUEST';
const BUSINESS_TYPE = 'PURCHASE_REQUEST';
const include = {
    summaryRequest: { select: { id: true, requestNo: true, status: true } },
    store: { select: { id: true, name: true } },
    purchaseOrder: { select: { id: true, orderNo: true, status: true } },
    items: { orderBy: { sortNo: 'asc' }, include: { item: { select: { id: true, code: true } } } },
};
const round2 = (n) => Math.round(n * 100) / 100;
let PurchaseRequestService = class PurchaseRequestService {
    prisma;
    workflowEngineService;
    purchaseOrderService;
    auditLogService;
    dataScope;
    ctx;
    itemImport;
    constructor(prisma, workflowEngineService, purchaseOrderService, auditLogService, dataScope, ctx, itemImport) {
        this.prisma = prisma;
        this.workflowEngineService = workflowEngineService;
        this.purchaseOrderService = purchaseOrderService;
        this.auditLogService = auditLogService;
        this.dataScope = dataScope;
        this.ctx = ctx;
        this.itemImport = itemImport;
    }
    async isProcurementStaff() {
        return (await this.ctx.hasPermission('inventory.purchase-request.collect')) || (await this.ctx.hasPermission('inventory.purchase-request.convert'));
    }
    async withCreatorNames(rows) {
        const ids = [...new Set(rows.map((r) => r.createdBy))];
        const accs = ids.length ? await this.prisma.account.findMany({ where: { id: { in: ids } }, select: { id: true, realName: true } }) : [];
        const name = new Map(accs.map((a) => [a.id, a.realName]));
        return rows.map((r) => ({ ...r, creatorName: name.get(r.createdBy) ?? '' }));
    }
    async findMany(query = {}) {
        const allowed = await this.dataScope.resolveAllowedStoreIds(this.ctx);
        const staff = await this.isProcurementStaff();
        const rows = await this.prisma.purchaseRequest.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                storeId: query.storeId ?? (allowed === 'ALL' ? undefined : { in: allowed }),
                status: query.status,
                kind: staff ? query.kind : 'DEPARTMENT',
                ...(staff ? {} : { createdBy: this.ctx.accountId }),
                ...(staff ? { NOT: { kind: 'DEPARTMENT', status: 'DRAFT', createdBy: { not: this.ctx.accountId } } } : {}),
            },
            include: {
                store: { select: { id: true, name: true } },
                purchaseOrder: { select: { id: true, orderNo: true } },
                summaryRequest: { select: { id: true, requestNo: true } },
                _count: { select: { items: true } },
                items: { select: { name: true, spec: true, brand: true } },
            },
            orderBy: [{ requestDate: 'desc' }, { createdAt: 'desc' }],
        });
        return this.withCreatorNames(await Promise.all(rows.map((r) => this.reconcileStatus(r))));
    }
    async findOneOrThrow(id) {
        const row = await this.prisma.purchaseRequest.findFirst({ where: { id, tenantId: this.ctx.tenantId }, include });
        if (!row)
            throw new common_1.NotFoundException(`PurchaseRequest ${id} 不存在`);
        await this.dataScope.assertStoreAccessible(this.ctx, row.storeId);
        if (!(await this.isProcurementStaff()) && (row.kind !== 'DEPARTMENT' || row.createdBy !== this.ctx.accountId)) {
            throw new common_1.ForbiddenException('只能查看自己提交的部门申购单');
        }
        return this.reconcileStatus(row);
    }
    async isCurrentApprover(id) {
        const pending = await this.prisma.workflowInstance.count({ where: { tenantId: this.ctx.tenantId, businessType: BUSINESS_TYPE, businessId: id, status: 'IN_REVIEW' } });
        if (pending > 0) {
            if (await this.ctx.hasPermission('workflow.definition.update'))
                return true;
            const mgr = await this.prisma.accountRoleAssignment.count({
                where: { accountId: this.ctx.accountId, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }], role: { code: { in: ['STORE_MANAGER', 'SUPER_ADMIN'] } } },
            });
            if (mgr > 0)
                return true;
        }
        const row = await this.prisma.workflowInstanceApprover.findFirst({
            where: { accountId: this.ctx.accountId, status: 'PENDING', role: { in: ['APPROVER', 'ADDED_APPROVER'] }, instance: { tenantId: this.ctx.tenantId, businessType: BUSINESS_TYPE, businessId: id, status: 'IN_REVIEW' } },
            include: { instance: { select: { currentNodeSeq: true } } },
        });
        return !!row && row.nodeSeq === row.instance.currentNodeSeq;
    }
    async detail(id) {
        const row = await this.findOneOrThrow(id);
        return { ...row, canApproverEdit: row.kind === 'SUMMARY' && row.status === 'PENDING_APPROVAL' && (await this.isCurrentApprover(id)) };
    }
    async createManual(body) {
        const store = await this.prisma.store.findFirst({ where: { id: body.storeId, tenantId: this.ctx.tenantId } });
        if (!store)
            throw new common_1.BadRequestException('请选择申购所属的门店');
        await this.dataScope.assertStoreAccessible(this.ctx, store.id);
        if (!body.items?.length)
            throw new common_1.BadRequestException('请至少添加一项要申购的物品');
        if (body.items.length > 500)
            throw new common_1.BadRequestException('一张申购单最多 500 行');
        const me = await this.prisma.account.findUnique({ where: { id: this.ctx.accountId }, select: { realName: true } });
        const rows = body.items.map((raw, i) => {
            if (!raw.name?.trim())
                throw new common_1.BadRequestException(`第 ${i + 1} 行请填写物品名称`);
            if (raw.quantity === undefined)
                throw new common_1.BadRequestException(`第 ${i + 1} 行（${raw.name}）请填写数量`);
            return { raw, data: this.normalize({ ...raw, requester: raw.requester ?? me?.realName }) };
        });
        const itemIdByKey = new Map();
        if (body.createMissingItems) {
            const fresh = rows.filter((r) => !r.raw.itemId && (0, inventory_item_import_service_1.norm)(r.raw.unit));
            if (fresh.length > 0) {
                const made = await this.itemImport.ensureItems(fresh.map((r, n) => ({ rowNo: n + 1, name: (0, inventory_item_import_service_1.norm)(r.raw.name), spec: (0, inventory_item_import_service_1.norm)(r.raw.spec) || null, brand: (0, inventory_item_import_service_1.norm)(r.raw.brand) || null, unit: (0, inventory_item_import_service_1.norm)(r.raw.unit) || null, referencePrice: r.data.unitPrice ?? null })), { createMissing: true, purpose: 'LOGISTICS' });
                made.forEach((v, k) => itemIdByKey.set(k, v));
            }
        }
        const lines = [];
        for (const [i, r] of rows.entries()) {
            const price = r.data.unitPrice ?? null;
            const key = (0, inventory_item_import_service_1.keyOf)((0, inventory_item_import_service_1.norm)(r.raw.name), (0, inventory_item_import_service_1.norm)(r.raw.spec) || null);
            const itemId = r.raw.itemId ?? itemIdByKey.get(key) ?? (await this.resolveItem((0, inventory_item_import_service_1.norm)(r.raw.name), (0, inventory_item_import_service_1.norm)(r.raw.spec) || null));
            lines.push({ ...r.data, sortNo: i + 1, itemId: itemId ?? null, subtotal: price === null ? 0 : round2(r.data.quantity * price) });
        }
        const created = await this.prisma.purchaseRequest.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId: store.id,
                requestNo: (0, business_no_util_1.generateBusinessNo)('SG'),
                requestDate: body.requestDate && /^\d{4}-\d{2}-\d{2}$/.test(body.requestDate) ? new Date(body.requestDate) : new Date(),
                kind: 'SUMMARY',
                status: 'DRAFT',
                totalAmount: round2(lines.reduce((s, l) => s + Number(l.subtotal ?? 0), 0)),
                remark: body.remark?.trim() || null,
                createdBy: this.ctx.accountId,
                items: { create: lines },
            },
            include,
        });
        await this.audit('STATE_TRANSITION', created.id, null, created, `手动新建申购单（${lines.length} 项）`, store.id);
        return created;
    }
    async createDepartment(body) {
        const me = await this.prisma.account.findUniqueOrThrow({ where: { id: this.ctx.accountId }, include: { department: { select: { name: true } } } });
        let storeId = body.storeId ?? me.storeId ?? this.ctx.homeStoreId ?? undefined;
        if (!storeId) {
            const allowed = await this.dataScope.resolveAllowedStoreIds(this.ctx);
            if (allowed !== 'ALL' && allowed.length === 1)
                storeId = allowed[0];
        }
        if (!storeId)
            throw new common_1.BadRequestException('您的账号还没有设置所属门店，请联系管理员在“账号管理 → 编辑”里补上门店，再填写申购单');
        await this.dataScope.assertStoreAccessible(this.ctx, storeId);
        if (!me.department?.name)
            throw new common_1.BadRequestException('您的账号还没有设置所属部门，申购单要写明申请部门。请联系管理员在“账号管理 → 编辑”里补上部门，再填写申购单');
        const departmentName = me.department.name;
        if (!body.items?.length)
            throw new common_1.BadRequestException('请至少填写一项要申购的物品');
        const lines = [];
        for (const [i, raw] of body.items.entries()) {
            if (!raw.name?.trim())
                throw new common_1.BadRequestException(`第 ${i + 1} 行请填写物品名称`);
            if (raw.quantity === undefined)
                throw new common_1.BadRequestException(`第 ${i + 1} 行（${raw.name}）请填写数量`);
            const data = this.normalize({ ...raw, department: departmentName, requester: me.realName });
            const price = data.unitPrice ?? null;
            const itemId = raw.itemId ?? (await this.resolveItem((0, inventory_item_import_service_1.norm)(raw.name), (0, inventory_item_import_service_1.norm)(raw.spec) || null));
            lines.push({ ...data, sortNo: i + 1, itemId: itemId ?? null, subtotal: price === null ? 0 : round2(data.quantity * price) });
        }
        const created = await this.prisma.purchaseRequest.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId,
                requestNo: (0, business_no_util_1.generateBusinessNo)('SG'),
                requestDate: body.requestDate ? new Date(body.requestDate) : new Date(),
                kind: 'DEPARTMENT',
                departmentName,
                status: body.submit ? 'SUBMITTED' : 'DRAFT',
                totalAmount: round2(lines.reduce((s, l) => s + Number(l.subtotal ?? 0), 0)),
                remark: body.remark?.trim() || null,
                createdBy: this.ctx.accountId,
                items: { create: lines },
            },
            include,
        });
        await this.audit('STATE_TRANSITION', created.id, null, created, `创建部门申购单（${departmentName}）${body.submit ? '并提交，等客服汇总' : ''}`, storeId);
        return created;
    }
    async recall(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.kind !== 'DEPARTMENT' || before.status !== 'SUBMITTED')
            throw new common_1.BadRequestException('只有已提交、还没被客服汇总的部门申购单可以撤回');
        if (before.createdBy !== this.ctx.accountId && !(await this.isProcurementStaff()))
            throw new common_1.ForbiddenException('只能撤回自己的申购单');
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.purchaseRequest.update({ where: { id, version: expectedVersion }, data: { status: 'DRAFT', version: { increment: 1 } }, include }));
        await this.audit('STATE_TRANSITION', id, before, updated, 'SUBMITTED -> DRAFT（撤回修改）', before.storeId);
        return updated;
    }
    async collect(ids, remark) {
        if (!ids?.length)
            throw new common_1.BadRequestException('请先勾选要汇总的部门申购单');
        const rows = await this.prisma.purchaseRequest.findMany({ where: { id: { in: ids }, tenantId: this.ctx.tenantId }, include: { items: { orderBy: { sortNo: 'asc' } } }, orderBy: { createdAt: 'asc' } });
        if (rows.length !== new Set(ids).size)
            throw new common_1.NotFoundException('有部门申购单不存在');
        const storeIds = new Set(rows.map((r) => r.storeId));
        if (storeIds.size > 1)
            throw new common_1.BadRequestException('一次只能汇总同一个门店的申购单');
        const bad = rows.find((r) => r.kind !== 'DEPARTMENT' || r.status !== 'SUBMITTED');
        if (bad)
            throw new common_1.BadRequestException(`申购单 ${bad.requestNo} 不是“已提交”的部门申购单（可能已被汇总或已撤回），请刷新后重新勾选`);
        const storeId = rows[0].storeId;
        await this.dataScope.assertStoreAccessible(this.ctx, storeId);
        const lines = rows.flatMap((r) => r.items);
        const summary = await this.prisma.$transaction(async (tx) => {
            const created = await tx.purchaseRequest.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    storeId,
                    requestNo: (0, business_no_util_1.generateBusinessNo)('SG'),
                    requestDate: new Date(),
                    kind: 'SUMMARY',
                    status: 'DRAFT',
                    totalAmount: round2(lines.reduce((s, l) => s + Number(l.subtotal), 0)),
                    remark: remark?.trim() || `汇总自：${rows.map((r) => `${r.departmentName ?? ''}${r.requestNo}`).join('、')}`,
                    createdBy: this.ctx.accountId,
                    items: {
                        create: lines.map((l, i) => ({
                            sortNo: i + 1,
                            itemId: l.itemId,
                            name: l.name,
                            spec: l.spec,
                            brand: l.brand,
                            unit: l.unit,
                            quantity: l.quantity,
                            unitPrice: l.unitPrice,
                            subtotal: l.subtotal,
                            department: l.department,
                            requester: l.requester,
                            purpose: l.purpose,
                            remark: l.remark,
                        })),
                    },
                },
                include,
            });
            await tx.purchaseRequest.updateMany({ where: { id: { in: rows.map((r) => r.id) } }, data: { status: 'COLLECTED', summaryRequestId: created.id } });
            return created;
        });
        await this.audit('STATE_TRANSITION', summary.id, null, summary, `汇总 ${rows.length} 张部门申购单：${rows.map((r) => r.requestNo).join('、')}`, storeId);
        return summary;
    }
    async draftOrThrow(id, expectedVersion) {
        const req = await this.findOneOrThrow(id);
        const byApprover = req.status === 'PENDING_APPROVAL' && req.kind === 'SUMMARY' && (await this.isCurrentApprover(id));
        if (req.status !== 'DRAFT' && !byApprover)
            throw new common_1.BadRequestException('只有草稿状态的申购单可以修改明细（待审批的只有当前审批人能改）');
        if (expectedVersion !== undefined && req.version !== expectedVersion)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        return { ...req, byApprover };
    }
    async auditLineChange(req, remark, before, after) {
        if (!req.byApprover)
            return;
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'PurchaseRequest',
            entityId: req.id,
            beforeData: before,
            afterData: after,
            remark: `审批人修改明细：${remark}`,
            tenantId: this.ctx.tenantId,
            storeId: req.storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
    }
    async resolveItem(name, spec) {
        const items = await this.prisma.inventoryItem.findMany({ where: { tenantId: this.ctx.tenantId, name }, select: { id: true, name: true, spec: true } });
        return items.find((i) => (0, inventory_item_import_service_1.keyOf)(i.name, i.spec) === (0, inventory_item_import_service_1.keyOf)(name, spec))?.id ?? null;
    }
    normalize(body) {
        const out = {};
        for (const k of ['name', 'spec', 'brand', 'unit', 'department', 'requester', 'purpose', 'remark']) {
            if (body[k] !== undefined)
                out[k] = (0, inventory_item_import_service_1.norm)(body[k]) || null;
        }
        if (out.name === null)
            throw new common_1.BadRequestException('物品名称不能为空');
        if (body.quantity !== undefined) {
            if (!Number.isInteger(body.quantity) || body.quantity < 1)
                throw new common_1.BadRequestException('数量应为大于 0 的整数');
            out.quantity = body.quantity;
        }
        if (body.unitPrice !== undefined) {
            if (body.unitPrice !== null && body.unitPrice < 0)
                throw new common_1.BadRequestException('单价不能是负数');
            out.unitPrice = body.unitPrice === null || body.unitPrice === 0 ? null : body.unitPrice;
        }
        if (body.itemId !== undefined)
            out.itemId = body.itemId || null;
        return out;
    }
    async recalc(tx, requestId) {
        const lines = await tx.purchaseRequestItem.findMany({ where: { purchaseRequestId: requestId } });
        const total = round2(lines.reduce((s, l) => s + Number(l.subtotal), 0));
        await tx.purchaseRequest.update({ where: { id: requestId }, data: { totalAmount: total, version: { increment: 1 } } });
    }
    async addLine(id, body, expectedVersion) {
        const req = await this.draftOrThrow(id, expectedVersion);
        if (!body.name?.trim())
            throw new common_1.BadRequestException('请填写物品名称');
        if (body.quantity === undefined)
            throw new common_1.BadRequestException('请填写数量');
        const data = this.normalize(body);
        const itemId = body.itemId !== undefined ? body.itemId : await this.resolveItem((0, inventory_item_import_service_1.norm)(body.name), (0, inventory_item_import_service_1.norm)(body.spec) || null);
        const max = await this.prisma.purchaseRequestItem.aggregate({ where: { purchaseRequestId: id }, _max: { sortNo: true } });
        await this.prisma.$transaction(async (tx) => {
            const price = data.unitPrice ?? null;
            await tx.purchaseRequestItem.create({
                data: { ...data, purchaseRequestId: id, sortNo: (max._max.sortNo ?? 0) + 1, itemId: itemId ?? null, subtotal: price === null ? 0 : round2(data.quantity * price) },
            });
            await this.recalc(tx, id);
        });
        await this.auditLineChange(req, `新增一行「${body.name}」×${body.quantity}`, null, body);
        return this.detail(id);
    }
    async updateLine(id, lineId, body, expectedVersion) {
        const req = await this.draftOrThrow(id, expectedVersion);
        const line = await this.prisma.purchaseRequestItem.findFirst({ where: { id: lineId, purchaseRequestId: id } });
        if (!line)
            throw new common_1.NotFoundException('这一行不存在');
        const data = this.normalize(body);
        const qty = data.quantity ?? line.quantity;
        const price = data.unitPrice !== undefined ? data.unitPrice : line.unitPrice === null ? null : Number(line.unitPrice);
        let itemId = data.itemId;
        if (itemId === undefined && (data.name !== undefined || data.spec !== undefined)) {
            itemId = await this.resolveItem(String(data.name ?? line.name), (data.spec !== undefined ? data.spec : line.spec) ?? null);
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.purchaseRequestItem.update({
                where: { id: lineId },
                data: { ...data, ...(itemId !== undefined ? { itemId } : {}), subtotal: price === null ? 0 : round2(qty * price) },
            });
            await this.recalc(tx, id);
        });
        await this.auditLineChange(req, `修改「${line.name}」`, { name: line.name, spec: line.spec, brand: line.brand, unit: line.unit, quantity: line.quantity, unitPrice: line.unitPrice }, body);
        return this.detail(id);
    }
    async removeLine(id, lineId, expectedVersion) {
        const req = await this.draftOrThrow(id, expectedVersion);
        if (req.items.length <= 1)
            throw new common_1.BadRequestException('至少要保留一行；整张不要了请用“取消申购单”');
        const line = req.items.find((l) => l.id === lineId);
        if (!line)
            throw new common_1.NotFoundException('这一行不存在');
        await this.prisma.$transaction(async (tx) => {
            await tx.purchaseRequestItem.delete({ where: { id: lineId } });
            await this.recalc(tx, id);
        });
        await this.auditLineChange(req, `删除「${line.name}」`, { name: line.name, spec: line.spec, quantity: line.quantity }, null);
        return this.detail(id);
    }
    async submit(id, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.status !== 'DRAFT')
            throw new common_1.BadRequestException(`申购单当前状态「${before.status}」不允许提交`);
        if (before.items.length === 0)
            throw new common_1.BadRequestException('申购单里没有物品');
        if (before.kind === 'DEPARTMENT') {
            if (before.createdBy !== this.ctx.accountId && !(await this.isProcurementStaff()))
                throw new common_1.ForbiddenException('只能提交自己的申购单');
            const submitted = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.purchaseRequest.update({ where: { id, version: expectedVersion }, data: { status: 'SUBMITTED', version: { increment: 1 } }, include }));
            await this.audit('STATE_TRANSITION', id, before, submitted, 'DRAFT -> SUBMITTED（提交给客服汇总）', before.storeId);
            return submitted;
        }
        await this.workflowEngineService.startInstance({ definitionCode: DEFINITION_CODE, businessType: BUSINESS_TYPE, businessId: id, title: before.requestNo, storeId: before.storeId }, this.actor());
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.purchaseRequest.update({ where: { id, version: expectedVersion }, data: { status: 'PENDING_APPROVAL', version: { increment: 1 } }, include }));
        await this.audit('STATE_TRANSITION', id, before, updated, 'DRAFT -> PENDING_APPROVAL', before.storeId);
        return updated;
    }
    async cancel(id, cancelReason, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (!['DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].includes(before.status))
            throw new common_1.BadRequestException(`申购单当前状态「${before.status}」不允许取消`);
        if (before.kind === 'DEPARTMENT' && before.createdBy !== this.ctx.accountId && !(await this.isProcurementStaff()))
            throw new common_1.ForbiddenException('只能取消自己的申购单');
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.$transaction(async (tx) => {
            await tx.purchaseRequest.updateMany({ where: { summaryRequestId: id, status: 'COLLECTED' }, data: { status: 'SUBMITTED', summaryRequestId: null } });
            return tx.purchaseRequest.update({ where: { id, version: expectedVersion }, data: { status: 'CANCELLED', cancelReason, version: { increment: 1 } }, include });
        }));
        await this.audit('STATE_TRANSITION', id, before, updated, `${before.status} -> CANCELLED：${cancelReason}`, before.storeId);
        return updated;
    }
    async convert(id, input, expectedVersion) {
        let before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (before.kind !== 'SUMMARY')
            throw new common_1.BadRequestException('部门申购单要先由客服汇总，汇总申购单审批通过后才能生成采购单');
        if (before.status !== 'APPROVED')
            throw new common_1.BadRequestException('只有已批准的申购单可以生成采购单');
        for (const fix of input.fixes ?? []) {
            const line = before.items.find((l) => l.id === fix.lineId);
            if (!line)
                throw new common_1.BadRequestException('补填的行不属于这张申购单');
            const data = {};
            if (fix.unitPrice !== undefined && line.unitPrice === null) {
                if (!(fix.unitPrice > 0))
                    throw new common_1.BadRequestException(`${line.name} 的单价应大于 0`);
                data.unitPrice = fix.unitPrice;
                data.subtotal = round2(line.quantity * fix.unitPrice);
            }
            if (fix.itemId && !line.itemId) {
                if (!(await this.prisma.inventoryItem.findFirst({ where: { id: fix.itemId, tenantId: this.ctx.tenantId }, select: { id: true } })))
                    throw new common_1.BadRequestException(`${line.name} 选的物品不存在`);
                data.itemId = fix.itemId;
            }
            if (Object.keys(data).length > 0)
                await this.prisma.purchaseRequestItem.update({ where: { id: line.id }, data });
        }
        if ((input.fixes ?? []).length > 0) {
            const lines = await this.prisma.purchaseRequestItem.findMany({ where: { purchaseRequestId: id } });
            const total = round2(lines.reduce((sum, l) => sum + Number(l.subtotal), 0));
            await this.prisma.purchaseRequest.update({ where: { id }, data: { totalAmount: total } });
            before = await this.findOneOrThrow(id);
        }
        const problems = before.items
            .filter((l) => !l.itemId || l.unitPrice === null)
            .map((l, i) => `第 ${l.sortNo ?? i + 1} 行 ${l.name}：${!l.itemId ? '还没有对应的物品资料' : '没有单价'}`);
        if (problems.length > 0) {
            throw new common_1.BadRequestException(`有 ${problems.length} 行还不能生成采购单：${problems.slice(0, 5).join('；')}${problems.length > 5 ? '…' : ''}。请在生成采购单时补全`);
        }
        const order = await this.purchaseOrderService.create({
            storeId: before.storeId,
            warehouseId: input.warehouseId,
            supplierId: input.supplierId,
            remark: `由申购单 ${before.requestNo} 生成`,
            items: before.items.map((l) => ({ itemId: l.itemId, quantity: l.quantity, unitPrice: Math.round(Number(l.unitPrice) * 100) })),
        }, { autoApprove: true });
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.purchaseRequest.update({ where: { id, version: expectedVersion }, data: { status: 'ORDERED', purchaseOrderId: order.id, version: { increment: 1 } }, include }));
        await this.audit('STATE_TRANSITION', id, before, updated, `APPROVED -> ORDERED（采购单 ${order.orderNo}）`, before.storeId);
        const orderTotalYuan = order.totalAmount / 100;
        return { request: updated, purchaseOrder: order, amountDiff: round2(orderTotalYuan - Number(before.totalAmount)) };
    }
    async reconcileStatus(row) {
        if (row.status !== 'PENDING_APPROVAL')
            return row;
        const instance = await this.prisma.workflowInstance.findFirst({ where: { businessType: BUSINESS_TYPE, businessId: row.id }, orderBy: { createdAt: 'desc' } });
        if (!instance)
            return row;
        let next = null;
        if (instance.status === 'APPROVED' || instance.status === 'ARCHIVED')
            next = 'APPROVED';
        else if (instance.status === 'REJECTED')
            next = 'REJECTED';
        else if (instance.status === 'WITHDRAWN')
            next = 'DRAFT';
        if (!next)
            return row;
        const updated = await this.prisma.purchaseRequest.update({ where: { id: row.id }, data: { status: next, version: { increment: 1 } } });
        await this.audit('STATE_TRANSITION', row.id, row, updated, `PENDING_APPROVAL -> ${next}（同步自 WorkflowInstance ${instance.id}）`, row.storeId);
        return { ...row, status: updated.status, version: updated.version };
    }
    assertVersion(before, expectedVersion) {
        if (before.version !== expectedVersion)
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
    }
    async audit(action, id, before, after, remark, storeId) {
        await this.auditLogService.record({
            action,
            entityType: 'PurchaseRequest',
            entityId: id,
            beforeData: before,
            afterData: after,
            remark,
            tenantId: this.ctx.tenantId,
            storeId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
    }
    actor() {
        return { accountId: this.ctx.accountId, tenantId: this.ctx.tenantId, storeId: this.ctx.homeStoreId, ip: this.ctx.ip, userAgent: this.ctx.userAgent, requestId: this.ctx.requestId };
    }
};
exports.PurchaseRequestService = PurchaseRequestService;
exports.PurchaseRequestService = PurchaseRequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_engine_service_1.WorkflowEngineService,
        purchase_order_service_1.PurchaseOrderService,
        audit_log_service_1.AuditLogService,
        data_scope_service_1.DataScopeService,
        request_context_service_1.RequestContextService,
        inventory_item_import_service_1.InventoryItemImportService])
], PurchaseRequestService);
//# sourceMappingURL=purchase-request.service.js.map