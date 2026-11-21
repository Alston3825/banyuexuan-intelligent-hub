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
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const pinyin_pro_1 = require("pinyin-pro");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const id_card_util_1 = require("../../common/utils/id-card.util");
const care_storage_service_1 = require("../../care/care-document/care-storage.service");
const profile_delete_util_1 = require("../../care/profile-delete.util");
const recycle_bin_service_1 = require("../../common/recycle/recycle-bin.service");
const recycle_tree_util_1 = require("../../common/recycle/recycle-tree.util");
let CustomerService = class CustomerService {
    prisma;
    auditLogService;
    ctx;
    storage;
    recycleBin;
    constructor(prisma, auditLogService, ctx, storage, recycleBin) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
        this.storage = storage;
        this.recycleBin = recycleBin;
    }
    findMany(query) {
        const where = {
            tenantId: this.ctx.tenantId,
            assignedToId: query.assignedToId,
            primaryStoreId: query.primaryStoreId,
            ...(query.archived === 'only' ? { archivedAt: { not: null } } : query.archived === 'all' ? {} : { archivedAt: null }),
            ...(query.keyword
                ? {
                    OR: [
                        { name: { contains: query.keyword } },
                        { phone: { contains: query.keyword } },
                        { customerNo: { contains: query.keyword } },
                    ],
                }
                : {}),
        };
        return this.prisma.customer.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async findOneOrThrow(id) {
        const customer = await this.prisma.customer.findUnique({ where: { id } });
        if (!customer)
            throw new common_1.NotFoundException(`Customer ${id} 不存在`);
        return customer;
    }
    async create(dto) {
        const { allowDuplicatePhone, expectedDueDate, birthday, registeredAt, ccAccountIds, idCardNo, channelTypeId, source, ...rest } = dto;
        await this.assertPhoneAvailable(dto.phone, allowDuplicatePhone);
        const idInfo = this.normalizeIdCard(idCardNo);
        const type = await this.resolveChannelType(channelTypeId, source, true);
        await this.assertChannel(dto.channelId, type.id);
        await this.assertReferrer(dto.referrerType, dto.referrerId);
        await this.assertAccounts([dto.assignedToId, dto.phoneSalesId, ...(ccAccountIds ?? [])]);
        const created = await this.prisma.customer.create({
            data: {
                ...rest,
                source: type.source,
                channelTypeId: type.id,
                idCardNo: idInfo?.normalized,
                expectedDueDate: expectedDueDate ? new Date(expectedDueDate) : undefined,
                birthday: birthday ? new Date(birthday) : idInfo?.birthday ? new Date(idInfo.birthday) : undefined,
                registeredAt: registeredAt ? new Date(registeredAt) : undefined,
                ccAccountIds: ccAccountIds && ccAccountIds.length > 0 ? ccAccountIds : undefined,
                assignedToId: dto.assignedToId ?? this.ctx.accountId,
                customerNo: (0, business_no_util_1.generateBusinessNo)('C'),
                tenantId: this.ctx.tenantId,
                createdBy: this.ctx.accountId,
            },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'Customer',
            entityId: created.id,
            afterData: created,
            ...this.auditCtx(),
        });
        return created;
    }
    async update(id, dto, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== expectedVersion) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        const { allowDuplicatePhone, expectedDueDate, birthday, registeredAt, ccAccountIds, idCardNo, channelTypeId, source, ...rest } = dto;
        if (dto.phone !== undefined && dto.phone !== before.phone)
            await this.assertPhoneAvailable(dto.phone, allowDuplicatePhone, id);
        const data = { ...rest };
        if (idCardNo !== undefined) {
            const idInfo = this.normalizeIdCard(idCardNo);
            data.idCardNo = idInfo ? idInfo.normalized : null;
            if (birthday === undefined && idInfo?.birthday)
                data.birthday = new Date(idInfo.birthday);
        }
        if (birthday !== undefined)
            data.birthday = birthday ? new Date(birthday) : null;
        if (expectedDueDate !== undefined)
            data.expectedDueDate = expectedDueDate ? new Date(expectedDueDate) : null;
        if (registeredAt)
            data.registeredAt = new Date(registeredAt);
        if (ccAccountIds !== undefined)
            data.ccAccountIds = ccAccountIds && ccAccountIds.length > 0 ? ccAccountIds : client_1.Prisma.DbNull;
        let nextTypeId = before.channelTypeId;
        if (channelTypeId !== undefined || source !== undefined) {
            const type = await this.resolveChannelType(channelTypeId, source, true, before.channelTypeId);
            if (type.id !== before.channelTypeId) {
                data.channelTypeId = type.id;
                data.source = type.source;
            }
            nextTypeId = type.id;
        }
        const nextChannelId = dto.channelId !== undefined ? dto.channelId : before.channelId;
        if (nextChannelId && (dto.channelId !== undefined || nextTypeId !== before.channelTypeId)) {
            const ok = await this.prisma.customerChannel.findFirst({ where: { id: nextChannelId, tenantId: this.ctx.tenantId, typeId: nextTypeId ?? undefined } });
            if (ok) {
                data.channelId = nextChannelId;
            }
            else if (dto.channelId) {
                throw new common_1.BadRequestException('所选具体渠道不属于该渠道类型');
            }
            else {
                data.channelId = null;
            }
        }
        if (dto.referrerType !== undefined || dto.referrerId !== undefined) {
            const type = dto.referrerType !== undefined ? dto.referrerType : before.referrerType;
            const refId = dto.referrerId !== undefined ? dto.referrerId : before.referrerId;
            if (type === 'CUSTOMER' && refId === id)
                throw new common_1.BadRequestException('推荐人不能是客户自己');
            await this.assertReferrer(type ?? undefined, refId ?? undefined);
        }
        await this.assertAccounts([dto.assignedToId, dto.phoneSalesId, ...(ccAccountIds ?? [])]);
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.customer.update({
            where: { id, version: expectedVersion },
            data: { ...data, version: { increment: 1 } },
        }));
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'Customer',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: Object.keys(dto),
            ...this.auditCtx(),
        });
        return updated;
    }
    async options() {
        const rows = await this.prisma.customer.findMany({
            where: { tenantId: this.ctx.tenantId, archivedAt: null },
            select: { id: true, name: true, phone: true, allergens: true },
            orderBy: { createdAt: 'desc' },
            take: 3000,
        });
        const mask = (p) => (p && p.length >= 7 ? `${p.slice(0, 3)}****${p.slice(-4)}` : (p ?? ''));
        return rows.map((c) => ({ id: c.id, name: c.name, phone: mask(c.phone), allergens: c.allergens ?? null }));
    }
    async assertActive(id) {
        const customer = await this.findOneOrThrow(id);
        if (customer.archivedAt)
            throw new common_1.ConflictException(`客户「${customer.name}」已归档，不能再新建业务；请先在客户管理里恢复该客户`);
        return customer;
    }
    async getDeleteCheck(id) {
        const c = await this.findOneOrThrow(id);
        if (c.tenantId !== this.ctx.tenantId)
            throw new common_1.NotFoundException(`Customer ${id} 不存在`);
        const where = { customerId: id };
        const [contracts, occupancies, payments, account, packages, appointments, diners, opportunities, linkedLeads, mothers] = await Promise.all([
            this.prisma.contract.count({ where }),
            this.prisma.roomOccupancy.count({ where }),
            this.prisma.payment.count({ where }),
            this.prisma.customerAccount.count({ where }),
            this.prisma.customerServicePackage.count({ where }),
            this.prisma.serviceAppointment.count({ where }),
            this.prisma.dinerProfile.count({ where }),
            this.prisma.salesOpportunity.findMany({ where, select: { id: true } }),
            this.prisma.lead.count({ where }),
            this.prisma.motherProfile.findMany({ where, select: { id: true } }),
        ]);
        const motherIds = mothers.map((m) => m.id);
        const care = await (0, profile_delete_util_1.motherProfilesDeleteCheck)(this.prisma, motherIds);
        const followUps = await this.prisma.followUpRecord.count({
            where: { tenantId: this.ctx.tenantId, OR: [{ businessType: 'CUSTOMER', businessId: id }, { businessType: 'OPPORTUNITY', businessId: { in: opportunities.map((o) => o.id) } }] },
        });
        const blockers = [
            contracts && `${contracts} 份合同`,
            occupancies && `${occupancies} 条预订/入住记录`,
            payments && `${payments} 笔收款`,
            account && '会员账户',
            packages && `${packages} 个已购服务包`,
            appointments && `${appointments} 条产康预约`,
            diners && `${diners} 个用膳档案`,
            ...care.blockers,
        ].filter(Boolean);
        const attached = [
            motherIds.length && `${motherIds.length} 份母婴档案`,
            care.babyCount && `${care.babyCount} 个宝宝档案`,
            ...care.attached,
            opportunities.length && `${opportunities.length} 个销售机会`,
            followUps && `${followUps} 条跟进记录`,
        ].filter(Boolean);
        return {
            customerId: id,
            customerName: c.name,
            blockers,
            attached,
            linkedLeads,
            canDelete: await this.ctx.hasPermission('crm.customer.delete'),
            canForceDeleteCare: await this.ctx.hasPermission('care.profile.force-delete'),
            canForceDelete: await this.ctx.hasPermission('crm.customer.force-delete'),
            archived: !!c.archivedAt,
        };
    }
    async remove(id, confirmName) {
        const check = await this.getDeleteCheck(id);
        const before = await this.findOneOrThrow(id);
        if (!check.canDelete)
            throw new common_1.ForbiddenException('删除客户需要管理员权限；不再使用的客户可以“归档”');
        const everything = [...check.blockers, ...check.attached];
        if (check.blockers.length > 0) {
            if (!check.canForceDelete)
                throw new common_1.ConflictException(`该客户已有${check.blockers.join('、')}，属于财务/医疗痕迹，不能删除；不再使用请点“归档”`);
            if (confirmName?.trim() !== check.customerName)
                throw new common_1.BadRequestException(`该客户名下有${everything.join('、')}，删除会连同这些一并删除（进回收站，30天内可还原）；请输入客户姓名「${check.customerName}」确认`);
        }
        else if (check.attached.length > 0) {
            const hasCare = check.attached.some((a) => a.includes('母婴档案') || a.includes('宝宝'));
            if (hasCare && !check.canForceDeleteCare)
                throw new common_1.ForbiddenException('该客户名下有母婴档案，连同删除需要“强制删除档案”权限，请联系管理员');
            if (confirmName?.trim() !== check.customerName)
                throw new common_1.BadRequestException(`该客户名下有${check.attached.join('、')}，删除会一并删除（进回收站，30天内可还原）；请输入客户姓名「${check.customerName}」确认`);
        }
        const { summary } = await this.recycleBin.deleteToBin({
            entityType: 'CUSTOMER',
            rootTable: 'customers',
            rootId: id,
            title: before.name,
            collectOptions: { keepNullables: ['leads.customer_id'] },
            addExtras: (c) => this.addCustomerExtras(c, id),
        });
        await this.auditLogService.record({
            action: 'DELETE',
            entityType: 'Customer',
            entityId: id,
            beforeData: before,
            remark: summary ? `连同 ${summary} 一起删除客户「${before.name}」（已进回收站）` : `删除客户「${before.name}」（已进回收站）`,
            ...this.auditCtx(),
        });
    }
    async addCustomerExtras(c, id) {
        const oppIds = c.idsOf('sales_opportunities');
        await c.collectByIdColumn('tag_bindings', 'entity_id', [id], "entity_type = 'Customer'");
        await c.collectByIdColumn('tag_bindings', 'entity_id', oppIds, "entity_type = 'SalesOpportunity'");
        await c.collectByIdColumn('follow_up_records', 'business_id', [id], "business_type = 'CUSTOMER'");
        await c.collectByIdColumn('follow_up_records', 'business_id', oppIds, "business_type = 'OPPORTUNITY'");
        await (0, profile_delete_util_1.addProfileExtras)(c);
        const refs = await this.prisma.customer.findMany({ where: { referrerType: 'CUSTOMER', referrerId: id }, select: { id: true, referrerType: true, referrerId: true } });
        if (refs.length > 0) {
            c.nulls.push({ table: 'customers', column: 'referrer_type', items: refs.map((r) => ({ id: r.id, value: r.referrerType })) });
            c.nulls.push({ table: 'customers', column: 'referrer_id', items: refs.map((r) => ({ id: r.id, value: r.referrerId })) });
        }
    }
    async mergePreview(sourceId, targetId) {
        const { source, target } = await this.loadMergePair(sourceId, targetId);
        const refs = await new recycle_tree_util_1.TreeCollector(this.prisma).referrers('customers');
        const moves = [];
        for (const r of refs) {
            const rows = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM \`${r.table}\` WHERE \`${r.column}\` = ?`, sourceId);
            const n = Number(rows[0]?.n ?? 0);
            if (n > 0)
                moves.push({ label: recycle_tree_util_1.TABLE_LABELS[r.table] ?? r.table, count: n });
        }
        const conflicts = [];
        const [sAcc, tAcc] = await Promise.all([this.prisma.customerAccount.count({ where: { customerId: sourceId } }), this.prisma.customerAccount.count({ where: { customerId: targetId } })]);
        if (sAcc > 0 && tAcc > 0)
            conflicts.push('两位客户都有会员账户，余额需要先人工处理后才能合并');
        return { source: { id: source.id, name: source.name, customerNo: source.customerNo }, target: { id: target.id, name: target.name, customerNo: target.customerNo }, moves, conflicts };
    }
    async merge(sourceId, targetId) {
        const preview = await this.mergePreview(sourceId, targetId);
        if (preview.conflicts.length > 0)
            throw new common_1.ConflictException(preview.conflicts.join('；'));
        const { source, target } = await this.loadMergePair(sourceId, targetId);
        const refs = await new recycle_tree_util_1.TreeCollector(this.prisma).referrers('customers');
        const fillable = ['wechat', 'serviceTypes', 'hospital', 'idCardNo', 'emergencyContactName', 'emergencyContactRelation', 'emergencyContactPhone', 'birthday', 'dietTaboo', 'allergens', 'zone', 'hisNo', 'passportNo', 'expectedDueDate', 'region', 'address', 'assignedToId', 'phoneSalesId', 'channelTypeId', 'channelId', 'primaryStoreId'];
        const patch = {};
        for (const f of fillable) {
            const tv = target[f];
            const sv = source[f];
            if ((tv === null || tv === undefined || tv === '') && sv !== null && sv !== undefined && sv !== '')
                patch[f] = sv;
        }
        if (!target.referrerType && source.referrerType && source.referrerId !== targetId) {
            patch.referrerType = source.referrerType;
            patch.referrerId = source.referrerId;
        }
        try {
            await this.recycleBin.deleteToBin({
                entityType: 'CUSTOMER',
                rootTable: 'customers',
                rootId: sourceId,
                title: `${source.name}（已合并到 ${target.name}）`,
                reason: 'MERGE',
                collectOptions: { keepNullables: ['leads.customer_id'] },
                beforeDelete: async (tx) => {
                    for (const r of refs) {
                        await tx.$executeRawUnsafe(`UPDATE \`${r.table}\` SET \`${r.column}\` = ? WHERE \`${r.column}\` = ?`, targetId, sourceId);
                    }
                    await tx.$executeRawUnsafe("UPDATE `follow_up_records` SET `business_id` = ? WHERE `business_type` = 'CUSTOMER' AND `business_id` = ?", targetId, sourceId);
                    await tx.$executeRawUnsafe("UPDATE `tag_bindings` SET `entity_id` = ? WHERE `entity_type` = 'Customer' AND `entity_id` = ?", targetId, sourceId);
                    await tx.$executeRawUnsafe("UPDATE `customers` SET `referrer_id` = ? WHERE `referrer_type` = 'CUSTOMER' AND `referrer_id` = ?", targetId, sourceId);
                    await tx.customer.update({ where: { id: targetId }, data: { ...patch, version: { increment: 1 } } });
                },
            });
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            if (/Duplicate entry|1062/.test(msg))
                throw new common_1.ConflictException('合并失败：两位客户在某类记录上有互相冲突的数据（唯一性限制），请先人工处理后再合并');
            throw e;
        }
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'Customer',
            entityId: targetId,
            remark: `合并客户：把「${source.name}」(${source.customerNo}) 的${preview.moves.map((m) => `${m.count} ${m.label}`).join('、') || '资料'}并入「${target.name}」(${target.customerNo})`,
            ...this.auditCtx(),
        });
    }
    async loadMergePair(sourceId, targetId) {
        if (sourceId === targetId)
            throw new common_1.BadRequestException('不能把客户合并到自己');
        const [source, target] = await Promise.all([this.findOneOrThrow(sourceId), this.findOneOrThrow(targetId)]);
        if (source.tenantId !== this.ctx.tenantId || target.tenantId !== this.ctx.tenantId)
            throw new common_1.NotFoundException('客户不存在');
        if (source.archivedAt)
            throw new common_1.ConflictException(`客户「${source.name}」已归档，请先恢复再合并`);
        if (target.archivedAt)
            throw new common_1.ConflictException(`客户「${target.name}」已归档，不能作为合并目标`);
        return { source, target };
    }
    async archive(id, reason) {
        const before = await this.findOneOrThrow(id);
        if (before.archivedAt)
            throw new common_1.ConflictException('这个客户已经归档了');
        const now = new Date();
        await this.prisma.$transaction([
            this.prisma.customer.update({ where: { id }, data: { archivedAt: now, archivedBy: this.ctx.accountId, archiveReason: reason?.trim() || null, version: { increment: 1 } } }),
            this.prisma.motherProfile.updateMany({ where: { customerId: id, archivedAt: null }, data: { archivedAt: now, archivedBy: this.ctx.accountId } }),
        ]);
        await this.auditLogService.record({ action: 'UPDATE', entityType: 'Customer', entityId: id, remark: `归档客户「${before.name}」${reason ? `：${reason}` : ''}`, ...this.auditCtx() });
    }
    async restore(id) {
        const before = await this.findOneOrThrow(id);
        if (!before.archivedAt)
            throw new common_1.ConflictException('这个客户没有归档');
        await this.prisma.$transaction([
            this.prisma.customer.update({ where: { id }, data: { archivedAt: null, archivedBy: null, archiveReason: null, version: { increment: 1 } } }),
            this.prisma.motherProfile.updateMany({ where: { customerId: id }, data: { archivedAt: null, archivedBy: null } }),
        ]);
        await this.auditLogService.record({ action: 'UPDATE', entityType: 'Customer', entityId: id, remark: `恢复已归档客户「${before.name}」`, ...this.auditCtx() });
    }
    async assertPhoneAvailable(phone, allow, excludeId) {
        if (allow)
            return;
        const dup = await this.prisma.customer.findFirst({
            where: { tenantId: this.ctx.tenantId, phone, ...(excludeId ? { id: { not: excludeId } } : {}) },
            select: { name: true, customerNo: true },
        });
        if (dup) {
            throw new common_1.ConflictException(`手机号 ${phone} 已被客户「${dup.name}」（${dup.customerNo}）使用，请直接使用该客户档案；如果确实是另一位客户（例如再次入住的妈妈），请在“新添客户”页勾选“再次入住妈妈，允许号码重复”后建档`);
        }
    }
    normalizeIdCard(raw) {
        if (!raw || !raw.trim())
            return null;
        const check = (0, id_card_util_1.checkIdCard)(raw);
        if (!check.valid)
            throw new common_1.BadRequestException(check.reason ?? '身份证号不正确');
        return { normalized: check.normalized, birthday: check.birthday };
    }
    async resolveChannelType(channelTypeId, source, mustBeActive, currentTypeId) {
        if (!channelTypeId && !source)
            throw new common_1.BadRequestException('请选择渠道类型');
        const type = channelTypeId
            ? await this.prisma.customerChannelType.findFirst({ where: { id: channelTypeId, tenantId: this.ctx.tenantId } })
            : await this.prisma.customerChannelType.findFirst({ where: { tenantId: this.ctx.tenantId, legacySource: source } });
        if (!type)
            throw new common_1.BadRequestException('所选渠道类型不存在');
        if (mustBeActive && type.status !== 'ACTIVE' && type.id !== currentTypeId)
            throw new common_1.BadRequestException(`渠道类型「${type.name}」已停用`);
        return { id: type.id, source: type.legacySource ?? 'OTHER' };
    }
    async assertChannel(channelId, typeId) {
        if (!channelId)
            return;
        const channel = await this.prisma.customerChannel.findFirst({ where: { id: channelId, tenantId: this.ctx.tenantId } });
        if (!channel)
            throw new common_1.BadRequestException('所选具体渠道不存在');
        if (channel.typeId !== typeId)
            throw new common_1.BadRequestException('所选具体渠道不属于该渠道类型');
        if (channel.status !== 'ACTIVE')
            throw new common_1.BadRequestException('所选具体渠道已停用');
    }
    async assertReferrer(type, refId) {
        if (!type && !refId)
            return;
        if (!type || !refId)
            throw new common_1.BadRequestException('推荐人类型和推荐人要同时填写');
        const exists = type === 'CUSTOMER'
            ? await this.prisma.customer.count({ where: { id: refId, tenantId: this.ctx.tenantId } })
            : await this.prisma.account.count({ where: { id: refId, tenantId: this.ctx.tenantId } });
        if (!exists)
            throw new common_1.BadRequestException('所选推荐人不存在');
    }
    async assertAccounts(ids) {
        const unique = [...new Set(ids.filter((x) => !!x))];
        if (unique.length === 0)
            return;
        const count = await this.prisma.account.count({ where: { id: { in: unique }, tenantId: this.ctx.tenantId } });
        if (count !== unique.length)
            throw new common_1.BadRequestException('包含不存在的员工账号');
    }
    initials(name) {
        return (0, pinyin_pro_1.pinyin)(name, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toLowerCase();
    }
    async staffOptions(keyword, salesOnly = false) {
        const accounts = await this.prisma.account.findMany({
            where: { tenantId: this.ctx.tenantId, status: 'ACTIVE', ...(salesOnly ? { department: { name: { contains: '销售' } } } : {}) },
            select: { id: true, realName: true, username: true },
            orderBy: { realName: 'asc' },
            take: 500,
        });
        const k = keyword?.trim().toLowerCase();
        if (!k)
            return accounts;
        return accounts.filter((a) => a.realName.includes(keyword.trim()) || a.username.toLowerCase().includes(k) || this.initials(a.realName).includes(k));
    }
    async searchReferrers(keyword) {
        const k = keyword.trim();
        if (!k)
            return { customers: [], accounts: [] };
        const lower = k.toLowerCase();
        const alphabetic = /^[a-z]+$/.test(lower);
        const customers = alphabetic
            ? (await this.prisma.customer.findMany({
                where: { tenantId: this.ctx.tenantId },
                select: { id: true, name: true, phone: true, customerNo: true },
            }))
                .filter((c) => this.initials(c.name).includes(lower))
                .slice(0, 10)
            : await this.prisma.customer.findMany({
                where: { tenantId: this.ctx.tenantId, OR: [{ name: { contains: k } }, { phone: { contains: k } }, { customerNo: { contains: k } }] },
                select: { id: true, name: true, phone: true, customerNo: true },
                take: 10,
            });
        const accounts = (await this.staffOptions(k)).slice(0, 10);
        return { customers, accounts };
    }
    checkIdCard(idCardNo) {
        return (0, id_card_util_1.checkIdCard)(idCardNo);
    }
    auditCtx() {
        return {
            tenantId: this.ctx.tenantId,
            storeId: this.ctx.homeStoreId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        };
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService,
        care_storage_service_1.CareStorageService,
        recycle_bin_service_1.RecycleBinService])
], CustomerService);
//# sourceMappingURL=customer.service.js.map