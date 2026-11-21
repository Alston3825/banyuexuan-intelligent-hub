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
var CareDocumentExtractionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareDocumentExtractionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ai_gateway_client_1 = require("../../ai/ai-gateway/ai-gateway.client");
const assessment_specs_1 = require("../care-assessment/assessment-specs");
const medication_specs_1 = require("../care-medication/medication-specs");
const daily_specs_1 = require("../care-daily/daily-specs");
const service_sheet_specs_1 = require("../care-plan-version/service-sheet-specs");
const care_storage_service_1 = require("./care-storage.service");
const nurse_name_match_1 = require("./nurse-name-match");
const MAX_CONCURRENT = 2;
let CareDocumentExtractionService = CareDocumentExtractionService_1 = class CareDocumentExtractionService {
    prisma;
    storage;
    aiGateway;
    logger = new common_1.Logger(CareDocumentExtractionService_1.name);
    active = 0;
    waiting = [];
    constructor(prisma, storage, aiGateway) {
        this.prisma = prisma;
        this.storage = storage;
        this.aiGateway = aiGateway;
    }
    async onModuleInit() {
        const res = await this.prisma.careDocument.updateMany({
            where: { extractStatus: { in: ['PENDING', 'RUNNING'] } },
            data: { extractStatus: 'FAILED', extractError: '服务重启时识别被中断，请点“重新识别”' },
        });
        if (res.count > 0)
            this.logger.warn(`已将 ${res.count} 份识别中断的护理资料标记为失败`);
    }
    isStructured(docType) {
        return docType in assessment_specs_1.FORM_SPECS || docType === 'DAILY_RECORD' || docType === 'MEDICATION_AUTH' || docType === 'CARE_PLAN';
    }
    aiSpec(docType, scope) {
        const slim = (f) => ({ key: f.key, label: f.label, kind: f.kind, options: f.options, unit: f.unit, min: f.min, max: f.max, aiHint: f.aiHint });
        if (docType === 'DAILY_RECORD' && scope === 'BABY_FEEDING') {
            return {
                formTitle: '新生儿日常护理记录（宝宝单页）',
                description: daily_specs_1.DAILY_BABY_AI_DESCRIPTION,
                fields: [
                    { key: 'sheetDate', label: '纸上的日期', kind: 'text', aiHint: '右上角“日期：”后手写的日期，如 8.26，原样抄下来' },
                    ...daily_specs_1.DAILY_BABY_FIELDS.flatMap((g) => g.fields).map(slim),
                    { key: 'feedings', label: '24小时宝宝喂养记录单', kind: 'table', columns: daily_specs_1.FEEDING_COLUMNS.map(slim) },
                ],
            };
        }
        if (docType === 'DAILY_RECORD') {
            return {
                formTitle: '新生儿和产妇日常护理记录',
                description: daily_specs_1.DAILY_AI_DESCRIPTION,
                fields: [{ key: 'sheetDate', label: '纸上的日期', kind: 'text', aiHint: '右上角“日期：”后手写的日期，如 10.18，原样抄下来' }, ...(0, daily_specs_1.dailyFlatFields)().map(slim), { key: 'feedings', label: '24小时宝宝喂养记录单', kind: 'table', columns: daily_specs_1.FEEDING_COLUMNS.map(slim) }],
            };
        }
        if (docType === 'CARE_PLAN')
            return (0, service_sheet_specs_1.serviceSheetAiSpec)();
        if (docType === 'MEDICATION_AUTH') {
            return {
                formTitle: '新生儿用药服药喂药委托书',
                description: medication_specs_1.MED_AI_DESCRIPTION,
                fields: [...medication_specs_1.MED_HEADER_FIELDS.map(slim), { key: 'items', label: '药品表格', kind: 'table', columns: medication_specs_1.MED_ITEM_COLUMNS.map(slim) }],
            };
        }
        const spec = assessment_specs_1.FORM_SPECS[docType];
        return spec ? { formTitle: spec.title, description: spec.aiDescription, fields: (0, assessment_specs_1.allFields)(spec).map(slim) } : null;
    }
    async dropOtherSexFields(babyProfileId, fields, result) {
        if (!babyProfileId)
            return;
        const baby = await this.prisma.babyProfile.findUnique({ where: { id: babyProfileId }, select: { gender: true } });
        if (baby?.gender !== 'MALE' && baby?.gender !== 'FEMALE')
            return;
        const other = baby.gender === 'MALE' ? '女' : '男';
        const drop = new Set(fields.filter((f) => f.label.startsWith(other)).map((f) => f.key));
        if (drop.size === 0)
            return;
        for (const k of drop)
            delete result.data[k];
        result.warnings = result.warnings.filter((w) => !drop.has(w.field));
    }
    async nurseRoster(tenantId, storeId) {
        const rows = await this.prisma.account.findMany({
            where: { tenantId, status: 'ACTIVE', department: { name: { contains: '护理' } }, ...(storeId ? { OR: [{ storeId }, { storeId: null }] } : {}) },
            select: { realName: true },
        });
        return [...new Set(rows.map((r) => r.realName.trim()).filter(Boolean))];
    }
    enqueue(documentId) {
        void this.runQueued(documentId);
    }
    async runQueued(documentId) {
        await this.prisma.careDocument.updateMany({ where: { id: documentId }, data: { extractStatus: 'PENDING', extractError: null } });
        if (this.active >= MAX_CONCURRENT)
            await new Promise((resolve) => this.waiting.push(resolve));
        this.active += 1;
        try {
            await this.run(documentId);
        }
        catch (err) {
            this.logger.error(`护理资料 ${documentId} 识别异常：${err.stack ?? err}`);
            await this.prisma.careDocument
                .updateMany({ where: { id: documentId }, data: { extractStatus: 'FAILED', extractError: err.message.slice(0, 500) } })
                .catch(() => undefined);
        }
        finally {
            this.active -= 1;
            this.waiting.shift()?.();
        }
    }
    async run(documentId) {
        const doc = await this.prisma.careDocument.findUnique({ where: { id: documentId }, include: { files: { orderBy: { sortOrder: 'asc' } } } });
        if (!doc)
            return;
        const spec = this.aiSpec(doc.docType, doc.extractScope);
        if (!spec)
            throw new Error('这类资料只做拍照留档，不需要识别');
        if (doc.files.length === 0)
            throw new Error('还没有上传照片，无法识别');
        await this.prisma.careDocument.update({ where: { id: documentId }, data: { extractStatus: 'RUNNING' } });
        const files = await Promise.all(doc.files.map(async (f) => ({ name: f.fileName, data: await this.storage.readBuffer(f.storagePath) })));
        const roster = await this.nurseRoster(doc.tenantId, doc.storeId);
        const result = await this.aiGateway.extractCareForm({ ...spec, fields: (0, nurse_name_match_1.withRosterHint)(spec.fields, roster) }, files);
        result.warnings.push(...(0, nurse_name_match_1.applyNurseRoster)(result.data, roster));
        await this.dropOtherSexFields(doc.babyProfileId, spec.fields, result);
        await this.prisma.careDocument.update({
            where: { id: documentId },
            data: {
                extractStatus: 'DONE',
                extractError: null,
                extractData: result.data,
                extractWarnings: result.warnings,
                extractModel: result.model,
                extractedAt: new Date(),
            },
        });
        this.logger.log(`护理资料 ${documentId}（${doc.docType}）识别完成：${Object.keys(result.data).length} 个字段，${result.warnings.length} 条提醒，用时 ${result.latency_ms}ms`);
    }
};
exports.CareDocumentExtractionService = CareDocumentExtractionService;
exports.CareDocumentExtractionService = CareDocumentExtractionService = CareDocumentExtractionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        care_storage_service_1.CareStorageService,
        ai_gateway_client_1.AiGatewayClient])
], CareDocumentExtractionService);
//# sourceMappingURL=care-document-extraction.service.js.map