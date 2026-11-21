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
var SatisfactionExtractionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SatisfactionExtractionService = void 0;
exports.parseSheetDate = parseSheetDate;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_gateway_client_1 = require("../ai/ai-gateway/ai-gateway.client");
const care_storage_service_1 = require("../care/care-document/care-storage.service");
const survey_specs_1 = require("./survey-specs");
const satisfaction_template_service_1 = require("./satisfaction-template.service");
const MAX_CONCURRENT = 2;
function parseSheetDate(raw, now = new Date()) {
    const m = String(raw ?? '').match(/(?:(\d{4})\s*[.\-/年]\s*)?(\d{1,2})\s*[.\-/月]\s*(\d{1,2})/);
    if (!m)
        return null;
    const month = Number(m[2]);
    const day = Number(m[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31)
        return null;
    let year = m[1] ? Number(m[1]) : now.getFullYear();
    if (!m[1] && month > now.getMonth() + 1)
        year -= 1;
    const d = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(d.getTime()) ? null : d;
}
let SatisfactionExtractionService = SatisfactionExtractionService_1 = class SatisfactionExtractionService {
    prisma;
    storage;
    aiGateway;
    logger = new common_1.Logger(SatisfactionExtractionService_1.name);
    active = 0;
    waiting = [];
    constructor(prisma, storage, aiGateway) {
        this.prisma = prisma;
        this.storage = storage;
        this.aiGateway = aiGateway;
    }
    async onModuleInit() {
        await this.prisma.satisfactionSurvey.updateMany({
            where: { extractStatus: { in: ['PENDING', 'RUNNING'] } },
            data: { extractStatus: 'FAILED', extractError: '服务重启时识别被中断，请点“重新识别”' },
        });
    }
    enqueue(id) {
        void this.runQueued(id);
    }
    async runQueued(id) {
        await this.prisma.satisfactionSurvey.updateMany({ where: { id }, data: { extractStatus: 'PENDING', extractError: null } });
        if (this.active >= MAX_CONCURRENT)
            await new Promise((resolve) => this.waiting.push(resolve));
        this.active += 1;
        try {
            await this.run(id);
        }
        catch (err) {
            this.logger.error(`满意度调查 ${id} 识别异常：${err.stack ?? err}`);
            await this.prisma.satisfactionSurvey.updateMany({ where: { id }, data: { extractStatus: 'FAILED', extractError: err.message.slice(0, 500) } }).catch(() => undefined);
        }
        finally {
            this.active -= 1;
            this.waiting.shift()?.();
        }
    }
    async run(id) {
        const survey = await this.prisma.satisfactionSurvey.findUnique({ where: { id }, include: { files: { orderBy: { sortOrder: 'asc' } } } });
        if (!survey)
            return;
        const tpl = survey.templateId ? await this.prisma.satisfactionTemplate.findUnique({ where: { id: survey.templateId } }) : null;
        if (!tpl)
            throw new Error('这份调查对应的模板不存在');
        const spec = (0, satisfaction_template_service_1.toSpec)(tpl);
        if (survey.files.length === 0)
            throw new Error('还没有上传照片，无法识别');
        await this.prisma.satisfactionSurvey.update({ where: { id }, data: { extractStatus: 'RUNNING' } });
        const files = await Promise.all(survey.files.map(async (f) => ({ name: f.fileName, data: await this.storage.readBuffer(f.storagePath) })));
        const result = await this.aiGateway.extractCareForm((0, survey_specs_1.surveyAiSpec)(spec), files);
        const data = result.data;
        const warnings = [...result.warnings];
        const scores = {};
        for (const item of (0, survey_specs_1.formItems)(spec)) {
            const v = Number(data[item.key]);
            if (data[item.key] !== null && data[item.key] !== undefined && Number.isInteger(v) && v >= 0 && v <= survey_specs_1.SCORE_MAX)
                scores[item.key] = v;
            else if (!warnings.some((w) => w.field === item.key))
                warnings.push({ field: item.key, level: 'info', message: '没识别到打勾的分值（客户可能没填），请对照原图核对' });
        }
        const text = (k) => (typeof data[k] === 'string' && data[k].trim() ? data[k].trim() : null);
        const customerName = text('customerName');
        let customerId = null;
        let storeId = survey.storeId;
        if (customerName) {
            const matches = await this.prisma.customer.findMany({ where: { tenantId: survey.tenantId, name: customerName }, select: { id: true, primaryStoreId: true }, take: 2 });
            if (matches.length === 1) {
                customerId = matches[0].id;
                storeId = storeId ?? matches[0].primaryStoreId;
            }
            else {
                warnings.push({ field: 'customerName', level: 'warn', message: matches.length === 0 ? '系统里没有找到同名客户，请手动选择对应的客户' : '有多位同名客户，请手动选择对应的客户' });
            }
        }
        const surveyDate = parseSheetDate(data.surveyDate);
        if (!surveyDate)
            warnings.push({ field: 'surveyDate', level: 'warn', message: '没读出填写日期，请补上' });
        await this.prisma.satisfactionSurvey.update({
            where: { id },
            data: {
                customerId: survey.customerId ?? customerId,
                storeId,
                customerName,
                roomNo: text('roomNo'),
                stewardName: text('stewardName'),
                nurseName: text('nurseName'),
                phone: text('phone'),
                surveyDate,
                scores: scores,
                suggestion: text('suggestion'),
                praise: text('praise'),
                extractStatus: 'DONE',
                extractError: null,
                extractWarnings: warnings,
                extractModel: result.model,
                extractedAt: new Date(),
            },
        });
        this.logger.log(`满意度调查 ${id}（${spec.name}）识别完成：${Object.keys(scores).length}/${(0, survey_specs_1.formItems)(spec).length} 项评分，${warnings.length} 条提醒`);
    }
};
exports.SatisfactionExtractionService = SatisfactionExtractionService;
exports.SatisfactionExtractionService = SatisfactionExtractionService = SatisfactionExtractionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        care_storage_service_1.CareStorageService,
        ai_gateway_client_1.AiGatewayClient])
], SatisfactionExtractionService);
//# sourceMappingURL=satisfaction-extraction.service.js.map