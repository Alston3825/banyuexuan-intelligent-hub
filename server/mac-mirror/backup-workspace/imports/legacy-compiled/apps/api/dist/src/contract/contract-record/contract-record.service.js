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
exports.ContractRecordService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const business_no_util_1 = require("../../common/utils/business-no.util");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const customer_service_1 = require("../../crm/customer/customer.service");
const contract_storage_service_1 = require("../contract-storage/contract-storage.service");
const contract_extraction_service_1 = require("../contract-extraction/contract-extraction.service");
const PLACEHOLDER_PHONES = new Set(['', '待补充']);
const ACTIVE_OCCUPANCY = ['RESERVED', 'CHECKED_IN'];
let ContractRecordService = class ContractRecordService {
    prisma;
    customerService;
    storage;
    extraction;
    auditLogService;
    ctx;
    constructor(prisma, customerService, storage, extraction, auditLogService, ctx) {
        this.prisma = prisma;
        this.customerService = customerService;
        this.storage = storage;
        this.extraction = extraction;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    listInclude = {
        signer: { select: { id: true, realName: true } },
        roomType: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
        roomOccupancies: { where: { status: { not: 'CANCELLED' } }, select: { id: true, status: true, roomId: true } },
    };
    async findMany(query) {
        const where = {
            tenantId: this.ctx.tenantId,
            customerId: query.customerId,
            storeId: query.storeId,
            status: query.unassigned ? 'ACTIVE' : query.status,
        };
        if (query.unassigned)
            where.roomOccupancies = { none: { status: { not: 'CANCELLED' } } };
        if (query.keyword?.trim()) {
            const k = query.keyword.trim();
            where.OR = [
                { paperNo: { contains: k } },
                { contractNo: { contains: k } },
                { clientName: { contains: k } },
                { clientPhone: { contains: k } },
                { customer: { name: { contains: k } } },
            ];
        }
        return this.prisma.contract.findMany({
            where,
            include: this.listInclude,
            orderBy: query.unassigned ? [{ signedDate: 'asc' }, { createdAt: 'asc' }] : { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const contract = await this.prisma.contract.findFirst({ where: { id, tenantId: this.ctx.tenantId } });
        if (!contract)
            throw new common_1.NotFoundException(`合同 ${id} 不存在`);
        return contract;
    }
    async getDetail(id) {
        const contract = await this.prisma.contract.findFirst({
            where: { id, tenantId: this.ctx.tenantId },
            include: {
                ...this.listInclude,
                customer: { select: { id: true, name: true, phone: true, customerNo: true } },
                files: { orderBy: [{ kind: 'asc' }, { pageNo: 'asc' }, { createdAt: 'asc' }] },
                items: { orderBy: { sortOrder: 'asc' } },
            },
        });
        if (!contract)
            throw new common_1.NotFoundException(`合同 ${id} 不存在`);
        return contract;
    }
    async createFromUpload(files, storeId) {
        if (!files?.length)
            throw new common_1.BadRequestException('请选择合同文件（PDF 或照片）');
        for (const f of files) {
            const isPdf = f.buffer.subarray(0, 4).toString() === '%PDF';
            const isImage = /^image\/(jpeg|png|webp)$/.test(f.mimetype);
            if (!isPdf && !isImage)
                throw new common_1.BadRequestException(`文件「${this.fileName(f)}」不是 PDF 或 JPG/PNG 图片`);
        }
        const contract = await this.createBlank(storeId, 'PENDING');
        for (const f of files) {
            const name = this.fileName(f);
            const rel = await this.storage.save(contract.id, 'orig', `${Date.now()}-${name}`, f.buffer);
            await this.prisma.contractFile.create({
                data: {
                    tenantId: contract.tenantId,
                    contractId: contract.id,
                    kind: 'ORIGINAL',
                    fileName: name,
                    storagePath: rel,
                    mimeType: f.buffer.subarray(0, 4).toString() === '%PDF' ? 'application/pdf' : f.mimetype,
                    sizeBytes: f.size,
                    createdBy: this.ctx.accountId,
                },
            });
        }
        this.extraction.enqueue(contract.id, contract.tenantId, this.ctx.accountId);
        return this.getDetail(contract.id);
    }
    async createManual(storeId) {
        const contract = await this.createBlank(storeId, 'NONE');
        return this.getDetail(contract.id);
    }
    async createBlank(storeId, extractStatus) {
        const resolvedStore = storeId ?? this.ctx.homeStoreId;
        if (!resolvedStore)
            throw new common_1.BadRequestException('请选择门店');
        const created = await this.prisma.contract.create({
            data: {
                tenantId: this.ctx.tenantId,
                contractNo: (0, business_no_util_1.generateBusinessNo)('CT'),
                storeId: resolvedStore,
                status: 'PENDING_REVIEW',
                extractStatus,
                signerId: this.ctx.accountId,
                createdBy: this.ctx.accountId,
            },
        });
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'Contract',
            entityId: created.id,
            afterData: created,
            remark: extractStatus === 'NONE' ? '手工新建合同' : '上传纸质合同',
            ...this.auditCtx(),
        });
        return created;
    }
    fileName(f) {
        return Buffer.from(f.originalname, 'latin1').toString('utf8');
    }
    async reextract(id) {
        const contract = await this.findOneOrThrow(id);
        if (contract.status !== 'PENDING_REVIEW')
            throw new common_1.BadRequestException('只有待核对的合同可以重新识别');
        if (['PENDING', 'RUNNING'].includes(contract.extractStatus))
            throw new common_1.ConflictException('正在识别中，请稍候');
        const originals = await this.prisma.contractFile.count({ where: { contractId: id, kind: 'ORIGINAL' } });
        if (originals === 0)
            throw new common_1.BadRequestException('这份合同没有上传原件，无法识别');
        this.extraction.enqueue(id, contract.tenantId, this.ctx.accountId);
        return this.getDetail(id);
    }
    async update(id, dto) {
        const { version, items, ...fields } = dto;
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, version);
        if (!['PENDING_REVIEW', 'ACTIVE'].includes(before.status))
            throw new common_1.BadRequestException('已作废的合同不能再修改');
        if (['PENDING', 'RUNNING'].includes(before.extractStatus))
            throw new common_1.ConflictException('AI 正在识别中，识别完成后再修改');
        const data = {};
        const plain = [
            'paperNo', 'signerId', 'clientName', 'clientPhone', 'clientIdCardNo', 'clientHospital', 'clientAddress',
            'emergencyName', 'emergencyRelation', 'emergencyPhone', 'fetus', 'roomTypeText', 'roomTypeId', 'orientation',
            'careMode', 'inHouseDays', 'homeServiceDays', 'daysText', 'amount', 'depositAmount', 'depositPaid', 'depositMethod',
        ];
        for (const key of plain) {
            if (fields[key] !== undefined)
                data[key] = fields[key];
        }
        for (const key of ['signedDate', 'dueDate', 'estimatedCheckIn', 'estimatedCheckOut', 'depositPaidAt']) {
            if (fields[key] !== undefined)
                data[key] = fields[key] ? new Date(fields[key]) : null;
        }
        if (fields.estimatedCheckOut === undefined && (fields.estimatedCheckIn !== undefined || fields.inHouseDays !== undefined)) {
            const checkIn = fields.estimatedCheckIn !== undefined ? (fields.estimatedCheckIn ? new Date(fields.estimatedCheckIn) : null) : before.estimatedCheckIn;
            const days = fields.inHouseDays !== undefined ? fields.inHouseDays : before.inHouseDays;
            data.estimatedCheckOut = checkIn && days ? (0, contract_extraction_service_1.addDays)(checkIn, days) : null;
        }
        if (fields.roomTypeText !== undefined && fields.roomTypeId === undefined) {
            data.roomTypeId = await this.extraction.matchRoomType(before.tenantId, fields.roomTypeText ?? null);
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const row = await (0, versioned_update_util_1.runVersionedUpdate)(() => tx.contract.update({ where: { id, version }, data: { ...data, version: { increment: 1 } } }));
            if (items) {
                await tx.contractItem.deleteMany({ where: { contractId: id } });
                const clean = items.filter((i) => i.name?.trim());
                if (clean.length > 0) {
                    await tx.contractItem.createMany({
                        data: clean.map((i, idx) => ({
                            tenantId: before.tenantId,
                            contractId: id,
                            kind: 'GIFT',
                            name: i.name.trim(),
                            quantity: i.quantity?.trim() || null,
                            needsReview: i.needsReview ?? false,
                            sortOrder: idx,
                        })),
                    });
                }
            }
            return row;
        });
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'Contract',
            entityId: id,
            beforeData: before,
            afterData: updated,
            changedFields: [...Object.keys(fields), ...(items ? ['items'] : [])],
            ...this.auditCtx(),
        });
        return this.getDetail(id);
    }
    async customerMatches(id) {
        const c = await this.findOneOrThrow(id);
        const select = { id: true, customerNo: true, name: true, phone: true, expectedDueDate: true };
        const phone = c.clientPhone?.trim();
        const [byPhone, byName] = await Promise.all([
            phone && !PLACEHOLDER_PHONES.has(phone)
                ? this.prisma.customer.findMany({ where: { tenantId: c.tenantId, phone }, select, take: 10 })
                : Promise.resolve([]),
            c.clientName?.trim()
                ? this.prisma.customer.findMany({ where: { tenantId: c.tenantId, name: c.clientName.trim() }, select, take: 10 })
                : Promise.resolve([]),
        ]);
        const matches = [];
        for (const m of byPhone)
            matches.push({ ...m, reason: 'PHONE' });
        for (const m of byName)
            if (!matches.some((x) => x.id === m.id))
                matches.push({ ...m, reason: 'NAME' });
        const phoneHits = matches.filter((m) => m.reason === 'PHONE');
        const suggestedId = phoneHits.length === 1 ? phoneHits[0].id : phoneHits.length === 0 && matches.length === 1 ? matches[0].id : null;
        return { matches, suggestedId };
    }
    async confirm(id, dto) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, dto.version);
        if (before.status !== 'PENDING_REVIEW')
            throw new common_1.BadRequestException('只有待核对的合同可以确认');
        if (['PENDING', 'RUNNING'].includes(before.extractStatus))
            throw new common_1.ConflictException('AI 正在识别中，识别完成后再确认');
        const missing = [];
        if (!before.clientName?.trim())
            missing.push('客户姓名');
        if (!before.clientPhone?.trim())
            missing.push('客户手机号');
        if (!before.paperNo?.trim())
            missing.push('合同编号');
        if (!before.signedDate)
            missing.push('签约日期');
        if (!before.roomTypeId && !before.roomTypeText?.trim())
            missing.push('房型');
        if (!before.careMode)
            missing.push('护理模式');
        if (!before.inHouseDays)
            missing.push('入住天数');
        if (!before.amount || before.amount <= 0)
            missing.push('套餐金额');
        if (missing.length > 0)
            throw new common_1.BadRequestException(`还有必填项没有填：${missing.join('、')}`);
        const customerId = await this.resolveCustomer(before, dto.customerId);
        const confirmed = await this.prisma.$transaction(async (tx) => {
            let depositPaymentId = before.depositPaymentId;
            if (before.depositPaid && before.depositAmount && before.depositAmount > 0 && !depositPaymentId) {
                const payment = await tx.payment.create({
                    data: {
                        tenantId: before.tenantId,
                        paymentNo: (0, business_no_util_1.generateBusinessNo)('PY'),
                        contractId: id,
                        customerId,
                        storeId: before.storeId,
                        amount: before.depositAmount,
                        method: before.depositMethod ?? 'CASH',
                        status: 'RECORDED',
                        remark: `合同定金（纸质合同 ${before.paperNo ?? before.contractNo}）`,
                        createdBy: this.ctx.accountId,
                    },
                });
                depositPaymentId = payment.id;
            }
            return (0, versioned_update_util_1.runVersionedUpdate)(() => tx.contract.update({
                where: { id, version: dto.version },
                data: {
                    customerId,
                    status: 'ACTIVE',
                    confirmedAt: new Date(),
                    confirmedById: this.ctx.accountId,
                    depositPaymentId,
                    version: { increment: 1 },
                },
            }));
        });
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'Contract',
            entityId: id,
            beforeData: before,
            afterData: confirmed,
            remark: 'PENDING_REVIEW -> ACTIVE（核对确认）',
            ...this.auditCtx(),
        });
        return this.getDetail(id);
    }
    async resolveCustomer(c, chosenId) {
        const signerId = c.signerId ?? this.ctx.accountId;
        const dueDateIso = c.dueDate ? c.dueDate.toISOString().slice(0, 10) : undefined;
        if (!chosenId) {
            const created = await this.customerService.create({
                allowDuplicatePhone: true,
                name: c.clientName.trim(),
                phone: c.clientPhone.trim(),
                source: 'OTHER',
                primaryStoreId: c.storeId,
                assignedToId: signerId ?? undefined,
                hospital: c.clientHospital ?? undefined,
                address: c.clientAddress ?? undefined,
                expectedDueDate: dueDateIso,
                idCardNo: c.clientIdCardNo ?? undefined,
                emergencyContactName: c.emergencyName ?? undefined,
                emergencyContactRelation: c.emergencyRelation ?? undefined,
                emergencyContactPhone: c.emergencyPhone ?? undefined,
            });
            return created.id;
        }
        const customer = await this.customerService.assertActive(chosenId);
        const patch = { allowDuplicatePhone: true };
        const blank = (v) => !v || !v.trim();
        if (PLACEHOLDER_PHONES.has(customer.phone.trim()) && c.clientPhone && /^1[3-9]\d{9}$/.test(c.clientPhone))
            patch.phone = c.clientPhone;
        if (blank(customer.idCardNo) && c.clientIdCardNo)
            patch.idCardNo = c.clientIdCardNo;
        if (blank(customer.hospital) && c.clientHospital)
            patch.hospital = c.clientHospital;
        if (blank(customer.address) && c.clientAddress)
            patch.address = c.clientAddress;
        if (!customer.expectedDueDate && dueDateIso)
            patch.expectedDueDate = dueDateIso;
        if (blank(customer.emergencyContactName) && c.emergencyName)
            patch.emergencyContactName = c.emergencyName;
        if (blank(customer.emergencyContactRelation) && c.emergencyRelation)
            patch.emergencyContactRelation = c.emergencyRelation;
        if (blank(customer.emergencyContactPhone) && c.emergencyPhone)
            patch.emergencyContactPhone = c.emergencyPhone;
        if (!customer.assignedToId && signerId)
            patch.assignedToId = signerId;
        if (Object.keys(patch).length > 1)
            await this.customerService.update(customer.id, patch, customer.version);
        return customer.id;
    }
    async void(id, voidReason, expectedVersion) {
        const before = await this.findOneOrThrow(id);
        this.assertVersion(before, expectedVersion);
        if (!['PENDING_REVIEW', 'ACTIVE'].includes(before.status)) {
            throw new common_1.BadRequestException(`合同当前状态「${before.status}」不允许作废`);
        }
        const active = await this.prisma.roomOccupancy.count({ where: { contractId: id, status: { in: [...ACTIVE_OCCUPANCY] } } });
        if (active > 0)
            throw new common_1.ConflictException('这份合同已经排了房（有未结束的预订/入住），请先取消预订或办理离店，再作废合同');
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.contract.update({ where: { id, version: expectedVersion }, data: { status: 'VOIDED', voidReason, version: { increment: 1 } } }));
        await this.auditLogService.record({
            action: 'VOID',
            entityType: 'Contract',
            entityId: id,
            beforeData: before,
            afterData: updated,
            remark: voidReason,
            ...this.auditCtx(),
        });
        return this.getDetail(id);
    }
    async remove(id) {
        const before = await this.findOneOrThrow(id);
        if (before.status !== 'PENDING_REVIEW')
            throw new common_1.ConflictException('已确认的合同不能删除，只能作废');
        if (['PENDING', 'RUNNING'].includes(before.extractStatus))
            throw new common_1.ConflictException('AI 正在识别中，请稍后再删除');
        await this.prisma.contract.delete({ where: { id } });
        await this.storage.removeContractDir(id);
        await this.auditLogService.record({ action: 'DELETE', entityType: 'Contract', entityId: id, beforeData: before, ...this.auditCtx() });
    }
    async openFile(contractId, fileId) {
        await this.findOneOrThrow(contractId);
        const file = await this.prisma.contractFile.findFirst({ where: { id: fileId, contractId } });
        if (!file)
            throw new common_1.NotFoundException('文件不存在');
        const { stream, size } = await this.storage.readStream(file.storagePath);
        return { stream, size, mimeType: file.mimeType, fileName: file.fileName };
    }
    assertVersion(before, expectedVersion) {
        if (before.version !== expectedVersion)
            throw new common_1.ConflictException('数据已被他人修改（或 AI 刚识别完成），请刷新后重试');
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
exports.ContractRecordService = ContractRecordService;
exports.ContractRecordService = ContractRecordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        customer_service_1.CustomerService,
        contract_storage_service_1.ContractStorageService,
        contract_extraction_service_1.ContractExtractionService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], ContractRecordService);
//# sourceMappingURL=contract-record.service.js.map