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
var ContractExtractionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractExtractionService = exports.DEFAULT_CHECK_IN_OFFSET_DAYS = void 0;
exports.addDays = addDays;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const ai_gateway_client_1 = require("../../ai/ai-gateway/ai-gateway.client");
const contract_storage_service_1 = require("../contract-storage/contract-storage.service");
exports.DEFAULT_CHECK_IN_OFFSET_DAYS = 4;
const MAX_CONCURRENT_EXTRACTIONS = 2;
function addDays(date, days) {
    return new Date(date.getTime() + days * 86_400_000);
}
let ContractExtractionService = ContractExtractionService_1 = class ContractExtractionService {
    prisma;
    storage;
    aiGateway;
    auditLogService;
    logger = new common_1.Logger(ContractExtractionService_1.name);
    active = 0;
    waiting = [];
    constructor(prisma, storage, aiGateway, auditLogService) {
        this.prisma = prisma;
        this.storage = storage;
        this.aiGateway = aiGateway;
        this.auditLogService = auditLogService;
    }
    async onModuleInit() {
        const res = await this.prisma.contract.updateMany({
            where: { extractStatus: { in: ['PENDING', 'RUNNING'] } },
            data: { extractStatus: 'FAILED', extractError: '服务重启时识别被中断，请点“重新识别”' },
        });
        if (res.count > 0)
            this.logger.warn(`已将 ${res.count} 份识别中断的合同标记为失败`);
    }
    enqueue(contractId, tenantId, accountId) {
        void this.runQueued(contractId, tenantId, accountId);
    }
    async runQueued(contractId, tenantId, accountId) {
        await this.prisma.contract.updateMany({ where: { id: contractId }, data: { extractStatus: 'PENDING', extractError: null } });
        if (this.active >= MAX_CONCURRENT_EXTRACTIONS) {
            await new Promise((resolve) => this.waiting.push(resolve));
        }
        this.active += 1;
        try {
            await this.run(contractId, tenantId, accountId);
        }
        catch (err) {
            this.logger.error(`合同 ${contractId} 识别异常：${err.stack ?? err}`);
            await this.prisma.contract
                .updateMany({ where: { id: contractId }, data: { extractStatus: 'FAILED', extractError: err.message.slice(0, 500) } })
                .catch(() => undefined);
        }
        finally {
            this.active -= 1;
            this.waiting.shift()?.();
        }
    }
    async run(contractId, tenantId, accountId) {
        await this.prisma.contract.updateMany({ where: { id: contractId }, data: { extractStatus: 'RUNNING' } });
        const originals = await this.prisma.contractFile.findMany({ where: { contractId, kind: 'ORIGINAL' }, orderBy: { createdAt: 'asc' } });
        if (originals.length === 0)
            throw new Error('这份合同没有上传原件，无法识别');
        const files = await Promise.all(originals.map(async (f) => ({ name: f.fileName, data: await this.storage.readBuffer(f.storagePath) })));
        const result = await this.aiGateway.extractContract(files);
        await this.storage.removePagesDir(contractId);
        await this.prisma.contractFile.deleteMany({ where: { contractId, kind: 'PAGE' } });
        for (const page of result.pages) {
            const rel = await this.storage.save(contractId, 'pages', `p${String(page.index).padStart(2, '0')}.jpg`, Buffer.from(page.jpeg_b64, 'base64'));
            await this.prisma.contractFile.create({
                data: {
                    tenantId,
                    contractId,
                    kind: 'PAGE',
                    fileName: `p${String(page.index).padStart(2, '0')}.jpg`,
                    storagePath: rel,
                    mimeType: 'image/jpeg',
                    sizeBytes: Buffer.byteLength(page.jpeg_b64, 'base64'),
                    pageNo: page.index,
                    pageKind: page.kind,
                    createdBy: accountId,
                },
            });
        }
        await this.applyResult(contractId, tenantId, accountId, result);
        this.logger.log(`合同 ${contractId} 识别完成：${result.pages.length} 页，${result.warnings.length} 条提醒，用时 ${result.latency_ms}ms`);
    }
    async applyResult(contractId, tenantId, accountId, result) {
        const d = result.data;
        const roomTypeId = await this.matchRoomType(tenantId, d.room_type_text);
        const dueDate = d.due_date ? new Date(d.due_date) : null;
        const estimatedCheckIn = dueDate ? addDays(dueDate, exports.DEFAULT_CHECK_IN_OFFSET_DAYS) : null;
        const estimatedCheckOut = estimatedCheckIn && d.in_house_days ? addDays(estimatedCheckIn, d.in_house_days) : null;
        await this.prisma.$transaction(async (tx) => {
            await tx.contract.update({
                where: { id: contractId },
                data: {
                    paperNo: d.contract_no,
                    signedDate: d.signed_date ? new Date(d.signed_date) : null,
                    clientName: d.mother_name,
                    clientPhone: d.phone,
                    clientIdCardNo: d.id_card_no,
                    clientHospital: d.hospital,
                    clientAddress: d.address,
                    emergencyName: d.emergency_name,
                    emergencyRelation: d.emergency_relation,
                    emergencyPhone: d.emergency_phone,
                    fetus: d.fetus,
                    dueDate,
                    roomTypeText: d.room_type_text,
                    roomTypeId,
                    orientation: d.orientation,
                    careMode: d.care_mode,
                    inHouseDays: d.in_house_days,
                    homeServiceDays: d.home_service_days ?? 0,
                    daysText: d.days_text,
                    amount: d.package_amount != null ? Math.round(d.package_amount * 100) : 0,
                    depositAmount: d.deposit_amount != null ? Math.round(d.deposit_amount * 100) : null,
                    estimatedCheckIn,
                    estimatedCheckOut,
                    extractStatus: 'DONE',
                    extractError: null,
                    extractWarnings: result.warnings,
                    extractedAt: new Date(),
                    version: { increment: 1 },
                },
            });
            await tx.contractItem.deleteMany({ where: { contractId } });
            if (d.gift_items.length > 0) {
                await tx.contractItem.createMany({
                    data: d.gift_items.map((g, i) => ({
                        tenantId,
                        contractId,
                        kind: 'GIFT',
                        name: g.name,
                        quantity: g.quantity,
                        needsReview: g.needs_review,
                        sortOrder: i,
                    })),
                });
            }
            await tx.contractExtraction.create({
                data: {
                    tenantId,
                    contractId,
                    model: result.model,
                    latencyMs: result.latency_ms,
                    result: { data: d, warnings: result.warnings, raw_pages: result.raw_pages, focus: result.focus, focus_amounts: result.focus_amounts },
                    createdBy: accountId,
                },
            });
        });
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'Contract',
            entityId: contractId,
            remark: `AI 识别完成（${result.model ?? '未知模型'}，${result.warnings.filter((w) => w.level !== 'info').length} 条需核对）`,
            tenantId,
            accountId,
        });
    }
    async matchRoomType(tenantId, text) {
        if (!text)
            return null;
        const normalized = text.replace(/\s/g, '');
        const types = await this.prisma.roomType.findMany({ where: { tenantId }, select: { id: true, name: true } });
        const hits = types.filter((t) => t.name && normalized.includes(t.name.replace(/\s/g, '')));
        hits.sort((a, b) => b.name.length - a.name.length);
        return hits[0]?.id ?? null;
    }
};
exports.ContractExtractionService = ContractExtractionService;
exports.ContractExtractionService = ContractExtractionService = ContractExtractionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        contract_storage_service_1.ContractStorageService,
        ai_gateway_client_1.AiGatewayClient,
        audit_log_service_1.AuditLogService])
], ContractExtractionService);
//# sourceMappingURL=contract-extraction.service.js.map