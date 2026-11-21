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
exports.SatisfactionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../audit/audit-log.service");
const request_context_service_1 = require("../common/context/request-context.service");
const ai_gateway_client_1 = require("../ai/ai-gateway/ai-gateway.client");
const care_storage_service_1 = require("../care/care-document/care-storage.service");
const satisfaction_extraction_service_1 = require("./satisfaction-extraction.service");
const survey_specs_1 = require("./survey-specs");
const satisfaction_template_service_1 = require("./satisfaction-template.service");
const filesSelect = { orderBy: { sortOrder: 'asc' }, select: { id: true, fileName: true, mimeType: true, sizeBytes: true, sortOrder: true } };
const isHeic = (f) => /^image\/hei[cf]$/i.test(f.mimetype) || /\.hei[cf]$/i.test(f.originalname);
const isPdf = (f) => f.buffer.subarray(0, 4).toString() === '%PDF';
const dayStr = (d) => d.toISOString().slice(0, 10);
let SatisfactionService = class SatisfactionService {
    prisma;
    storage;
    extraction;
    aiGateway;
    auditLogService;
    ctx;
    constructor(prisma, storage, extraction, aiGateway, auditLogService, ctx) {
        this.prisma = prisma;
        this.storage = storage;
        this.extraction = extraction;
        this.aiGateway = aiGateway;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    async specs() {
        await (0, satisfaction_template_service_1.ensureDefaultTemplates)(this.prisma, this.ctx.tenantId, this.ctx.accountId);
        const rows = await this.prisma.satisfactionTemplate.findMany({ where: { tenantId: this.ctx.tenantId }, orderBy: [{ sortNo: 'asc' }, { createdAt: 'asc' }] });
        return { templates: rows.map((t) => ({ ...(0, satisfaction_template_service_1.toSpec)(t), status: t.status })), scoreMax: survey_specs_1.SCORE_MAX, satisfiedMin: survey_specs_1.SATISFIED_MIN, unsatisfiedMax: survey_specs_1.UNSATISFIED_MAX };
    }
    async templateOf(templateId) {
        const t = templateId ? await this.prisma.satisfactionTemplate.findFirst({ where: { id: templateId, tenantId: this.ctx.tenantId } }) : null;
        if (!t)
            throw new common_1.NotFoundException('这份调查对应的模板不存在');
        return t;
    }
    where(f) {
        const dateWhere = {};
        if (f.from)
            dateWhere.gte = new Date(`${f.from}T00:00:00.000Z`);
        if (f.to)
            dateWhere.lte = new Date(`${f.to}T00:00:00.000Z`);
        const k = f.keyword?.trim();
        return {
            tenantId: this.ctx.tenantId,
            templateId: f.templateId || undefined,
            status: f.status || undefined,
            storeId: f.storeId || undefined,
            stewardName: f.steward || undefined,
            ...(f.from || f.to ? { surveyDate: dateWhere } : {}),
            ...(k ? { OR: [{ customerName: { contains: k } }, { roomNo: { contains: k } }, { stewardName: { contains: k } }, { nurseName: { contains: k } }, { suggestion: { contains: k } }, { praise: { contains: k } }] } : {}),
        };
    }
    async list(q) {
        const rows = await this.prisma.satisfactionSurvey.findMany({
            where: this.where(q),
            include: { files: filesSelect },
            orderBy: [{ createdAt: 'desc' }],
            take: 500,
        });
        const ids = [...new Set(rows.map((r) => r.customerId).filter((x) => !!x))];
        const customers = ids.length ? await this.prisma.customer.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, phone: true } }) : [];
        const byId = new Map(customers.map((c) => [c.id, c]));
        return rows.map((r) => ({ ...r, customer: r.customerId ? byId.get(r.customerId) ?? null : null }));
    }
    async getOne(id) {
        const row = await this.prisma.satisfactionSurvey.findFirst({ where: { id, tenantId: this.ctx.tenantId }, include: { files: filesSelect } });
        if (!row)
            throw new common_1.NotFoundException('调查记录不存在');
        const customer = row.customerId ? await this.prisma.customer.findUnique({ where: { id: row.customerId }, select: { id: true, name: true, phone: true } }) : null;
        return { ...row, customer };
    }
    async create(files, dto) {
        await (0, satisfaction_template_service_1.ensureDefaultTemplates)(this.prisma, this.ctx.tenantId, this.ctx.accountId);
        const tpl = await this.prisma.satisfactionTemplate.findFirst({ where: { id: dto.templateId, tenantId: this.ctx.tenantId } });
        if (!tpl)
            throw new common_1.BadRequestException('请选择调查表模板');
        if (tpl.status !== 'ACTIVE')
            throw new common_1.BadRequestException('这个模板已停用，请选择启用中的模板');
        for (const f of files ?? []) {
            if (!isPdf(f) && !/^image\/(jpeg|png|webp|hei[cf])$/i.test(f.mimetype) && !isHeic(f)) {
                throw new common_1.BadRequestException(`文件「${this.fileName(f)}」不是照片（JPG/PNG/HEIC）或 PDF`);
            }
        }
        let storeId = this.ctx.homeStoreId ?? null;
        if (dto.customerId) {
            const c = await this.prisma.customer.findFirst({ where: { id: dto.customerId, tenantId: this.ctx.tenantId }, select: { primaryStoreId: true } });
            if (!c)
                throw new common_1.NotFoundException('客户不存在');
            storeId = c.primaryStoreId ?? storeId;
        }
        const created = await this.prisma.satisfactionSurvey.create({
            data: {
                tenantId: this.ctx.tenantId,
                storeId,
                formNo: tpl.sortNo,
                templateId: tpl.id,
                customerId: dto.customerId ?? null,
                scores: {},
                extractStatus: files?.length ? 'PENDING' : 'NONE',
                createdBy: this.ctx.accountId,
            },
        });
        if (files?.length) {
            await this.saveFiles(created.id, files, 0);
            this.extraction.enqueue(created.id);
        }
        await this.audit('CREATE', created.id, { template: tpl.name, files: files?.length ?? 0 });
        return this.getOne(created.id);
    }
    async addFiles(id, files) {
        if (!files?.length)
            throw new common_1.BadRequestException('请选择照片或 PDF 文件');
        const row = await this.getOne(id);
        await this.saveFiles(id, files, row.files.length);
        return this.getOne(id);
    }
    async update(id, patch) {
        const row = await this.getOne(id);
        const spec = (0, satisfaction_template_service_1.toSpec)(await this.templateOf(row.templateId));
        const data = { version: { increment: 1 } };
        const str = (v) => (v === undefined ? undefined : v?.trim() || null);
        if (patch.customerName !== undefined)
            data.customerName = str(patch.customerName);
        if (patch.roomNo !== undefined)
            data.roomNo = str(patch.roomNo);
        if (patch.stewardName !== undefined)
            data.stewardName = str(patch.stewardName);
        if (patch.nurseName !== undefined)
            data.nurseName = str(patch.nurseName);
        if (patch.phone !== undefined)
            data.phone = str(patch.phone);
        if (patch.suggestion !== undefined)
            data.suggestion = str(patch.suggestion);
        if (patch.praise !== undefined)
            data.praise = str(patch.praise);
        if (patch.surveyDate !== undefined)
            data.surveyDate = patch.surveyDate ? new Date(`${patch.surveyDate.slice(0, 10)}T00:00:00.000Z`) : null;
        if (patch.customerId !== undefined) {
            if (patch.customerId) {
                const c = await this.prisma.customer.findFirst({ where: { id: patch.customerId, tenantId: this.ctx.tenantId }, select: { name: true, primaryStoreId: true } });
                if (!c)
                    throw new common_1.NotFoundException('客户不存在');
                data.customerId = patch.customerId;
                if (!row.storeId && c.primaryStoreId)
                    data.storeId = c.primaryStoreId;
            }
            else {
                data.customerId = null;
            }
        }
        if (patch.scores) {
            const valid = new Set((0, survey_specs_1.formItems)(spec).map((i) => i.key));
            const next = { ...(row.scores ?? {}) };
            for (const [k, v] of Object.entries(patch.scores)) {
                if (!valid.has(k))
                    continue;
                if (v === null || v === undefined)
                    delete next[k];
                else if (Number.isInteger(v) && v >= 0 && v <= survey_specs_1.SCORE_MAX)
                    next[k] = v;
                else
                    throw new common_1.BadRequestException(`分值必须是 0~${survey_specs_1.SCORE_MAX} 的整数`);
            }
            data.scores = next;
        }
        await this.prisma.satisfactionSurvey.update({ where: { id }, data });
        await this.audit('UPDATE', id, { fields: Object.keys(patch) });
        return this.getOne(id);
    }
    async confirm(id) {
        const row = await this.getOne(id);
        const scores = row.scores ?? {};
        if (Object.keys(scores).length === 0 && !row.suggestion && !row.praise)
            throw new common_1.BadRequestException('还没有任何评分或意见，不能确认');
        if (!row.customerName && !row.customerId)
            throw new common_1.BadRequestException('请先填写或选择客户');
        await this.prisma.satisfactionSurvey.update({ where: { id }, data: { status: 'CONFIRMED', confirmedBy: this.ctx.accountId, confirmedAt: new Date(), version: { increment: 1 } } });
        await this.audit('UPDATE', id, { status: 'CONFIRMED' });
        return this.getOne(id);
    }
    async unconfirm(id) {
        await this.getOne(id);
        await this.prisma.satisfactionSurvey.update({ where: { id }, data: { status: 'DRAFT', confirmedBy: null, confirmedAt: null, version: { increment: 1 } } });
        return this.getOne(id);
    }
    async reextract(id) {
        const row = await this.getOne(id);
        if (row.files.length === 0)
            throw new common_1.BadRequestException('还没有上传照片');
        if (row.extractStatus === 'PENDING' || row.extractStatus === 'RUNNING')
            throw new common_1.ConflictException('正在识别中，请稍候');
        await this.prisma.satisfactionSurvey.update({ where: { id }, data: { extractStatus: 'PENDING', extractError: null } });
        this.extraction.enqueue(id);
        return this.getOne(id);
    }
    async remove(id) {
        const row = await this.getOne(id);
        await this.prisma.satisfactionSurvey.delete({ where: { id } });
        await this.storage.removeDocumentDir(`satisfaction-${id}`);
        await this.audit('DELETE', id, { formNo: row.formNo, customerName: row.customerName });
    }
    async openFile(id, fileId) {
        const file = await this.prisma.satisfactionSurveyFile.findFirst({ where: { id: fileId, surveyId: id, tenantId: this.ctx.tenantId } });
        if (!file)
            throw new common_1.NotFoundException('文件不存在');
        const { stream, size } = await this.storage.readStream(file.storagePath);
        return { stream, size, mimeType: file.mimeType, fileName: file.fileName };
    }
    async stats(f) {
        const rows = await this.prisma.satisfactionSurvey.findMany({ where: this.where({ ...f, status: 'CONFIRMED' }), orderBy: { surveyDate: 'asc' } });
        const level = (v) => (v >= survey_specs_1.SATISFIED_MIN ? 'good' : v <= survey_specs_1.UNSATISFIED_MAX ? 'bad' : 'mid');
        const avg = (xs) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : null);
        const tpls = (await this.prisma.satisfactionTemplate.findMany({ where: { tenantId: this.ctx.tenantId, ...(f.templateId ? { id: f.templateId } : {}) }, orderBy: [{ sortNo: 'asc' }, { createdAt: 'asc' }] })).map(satisfaction_template_service_1.toSpec);
        const forms = tpls.map((spec) => {
            const list = rows.filter((r) => r.templateId === spec.id);
            const scoresOf = (key) => list.map((r) => r.scores?.[key]).filter((v) => typeof v === 'number');
            const groups = spec.groups.map((g) => {
                const items = g.items.map((it) => {
                    const vs = scoresOf(it.key);
                    const histogram = Array.from({ length: survey_specs_1.SCORE_MAX + 1 }, (_, s) => vs.filter((v) => v === s).length);
                    return { key: it.key, label: it.label, count: vs.length, avg: avg(vs), good: vs.filter((v) => level(v) === 'good').length, mid: vs.filter((v) => level(v) === 'mid').length, bad: vs.filter((v) => level(v) === 'bad').length, histogram };
                });
                return { key: g.key, title: g.title, avg: avg(items.flatMap((i) => scoresOf(i.key))), items };
            });
            const all = (0, survey_specs_1.formItems)(spec).flatMap((i) => scoresOf(i.key));
            return {
                templateId: spec.id,
                title: spec.name,
                day: spec.day,
                count: list.length,
                avg: avg(all),
                satisfiedRate: all.length ? Math.round((all.filter((v) => level(v) === 'good').length / all.length) * 1000) / 10 : null,
                groups,
            };
        });
        const lowItems = forms
            .flatMap((fm) => fm.groups.flatMap((g) => g.items.map((i) => ({ templateId: fm.templateId, formTitle: fm.title, groupTitle: g.title, key: i.key, label: i.label, avg: i.avg, count: i.count, bad: i.bad }))))
            .filter((i) => i.avg !== null)
            .sort((a, b) => a.avg - b.avg)
            .slice(0, 5);
        const trend = new Map();
        for (const r of rows) {
            if (!r.surveyDate)
                continue;
            const spec = tpls.find((t) => t.id === r.templateId);
            if (!spec)
                continue;
            const sc = r.scores ?? {};
            for (const it of (0, survey_specs_1.formItems)(spec)) {
                if (typeof sc[it.key] !== 'number')
                    continue;
                const key = `${dayStr(r.surveyDate).slice(0, 7)}|${spec.id}`;
                const t = trend.get(key) ?? { month: dayStr(r.surveyDate).slice(0, 7), templateId: spec.id, sum: 0, n: 0 };
                t.sum += sc[it.key];
                t.n += 1;
                trend.set(key, t);
            }
        }
        const staff = new Map();
        for (const r of rows) {
            const name = r.stewardName?.trim();
            if (!name)
                continue;
            const sc = Object.values(r.scores ?? {}).filter((v) => typeof v === 'number');
            const s = staff.get(name) ?? { name, surveys: 0, sum: 0, n: 0 };
            s.surveys += 1;
            s.sum += sc.reduce((a, b) => a + b, 0);
            s.n += sc.length;
            staff.set(name, s);
        }
        return {
            total: rows.length,
            pending: await this.prisma.satisfactionSurvey.count({ where: this.where({ ...f, status: 'DRAFT' }) }),
            scoreMax: survey_specs_1.SCORE_MAX,
            forms,
            lowItems,
            trend: [...trend.values()].sort((a, b) => a.month.localeCompare(b.month) || a.templateId.localeCompare(b.templateId)).map((t) => ({ month: t.month, templateId: t.templateId, avg: Math.round((t.sum / t.n) * 100) / 100 })),
            staff: [...staff.values()].filter((s) => s.n > 0).map((s) => ({ name: s.name, surveys: s.surveys, avg: Math.round((s.sum / s.n) * 100) / 100 })).sort((a, b) => b.avg - a.avg),
        };
    }
    async comments(f) {
        const rows = await this.prisma.satisfactionSurvey.findMany({
            where: { ...this.where({ ...f, status: 'CONFIRMED' }), OR: [{ suggestion: { not: null } }, { praise: { not: null } }] },
            orderBy: [{ surveyDate: 'desc' }, { createdAt: 'desc' }],
            take: 300,
            select: { id: true, formNo: true, templateId: true, customerName: true, roomNo: true, stewardName: true, surveyDate: true, suggestion: true, praise: true },
        });
        return rows;
    }
    async summarize(f) {
        const rows = await this.comments(f);
        const sug = rows.filter((r) => r.suggestion).map((r, i) => `${i + 1}. ${r.suggestion.replace(/\s+/g, ' ')}`);
        const pra = rows.filter((r) => r.praise).map((r, i) => `${i + 1}. ${r.praise.replace(/\s+/g, ' ')}`);
        if (sug.length + pra.length === 0)
            return { content: '还没有客户手写的意见、建议或表扬，暂时没有可汇总的内容。', suggestionCount: 0, praiseCount: 0 };
        const prompt = [
            '你是月子中心的运营分析助手。下面是客户在满意度调查表上手写的内容（已由人工核对），请用简体中文做汇总分析，输出：',
            '1）【意见建议归类】按主题（如餐食、环境设施、服务态度、护理专业度、价格、其他）归类，每个主题写出现次数和代表性原话；',
            '2）【最需要优先改进的 3 件事】结合出现次数给出，并各给一条具体可落实的改进建议；',
            '3）【表扬汇总】被表扬的人、事、物各是什么，出现几次。',
            '只依据下面的内容，不要编造；某部分没有内容就写“暂无”。语言简洁，用条目列出。',
            '',
            `【意见建议】（共 ${sug.length} 条）`,
            sug.join('\n') || '无',
            '',
            `【表扬】（共 ${pra.length} 条）`,
            pra.join('\n') || '无',
        ].join('\n');
        const res = await this.aiGateway.complete([{ role: 'user', content: prompt }]);
        return { content: res.content, suggestionCount: sug.length, praiseCount: pra.length };
    }
    fileName(f) {
        return Buffer.from(f.originalname, 'latin1').toString('utf8');
    }
    async audit(action, id, data) {
        await this.auditLogService.record({
            action,
            entityType: 'SatisfactionSurvey',
            entityId: id,
            afterData: data,
            tenantId: this.ctx.tenantId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
    }
    async saveFiles(surveyId, files, startOrder) {
        const dir = `satisfaction-${surveyId}`;
        let order = startOrder;
        for (const f of files) {
            const name = this.fileName(f);
            const stamp = Date.now();
            let storagePath;
            let originalPath = null;
            let mimeType = isPdf(f) ? 'application/pdf' : f.mimetype;
            let displayName = name;
            let size = f.size;
            if (isHeic(f)) {
                let jpeg;
                try {
                    jpeg = await this.aiGateway.normalizeImage(f.buffer);
                }
                catch (err) {
                    throw new common_1.BadRequestException(`苹果 HEIC 照片转换失败（${err.message}）。请在手机上把照片分享为 JPG 再上传，或检查 AI 服务是否在运行`);
                }
                originalPath = await this.storage.save(dir, `${stamp}-orig-${name}`, f.buffer);
                displayName = name.replace(/\.[^.]+$/, '') + '.jpg';
                storagePath = await this.storage.save(dir, `${stamp}-${displayName}`, jpeg);
                mimeType = 'image/jpeg';
                size = jpeg.length;
            }
            else {
                storagePath = await this.storage.save(dir, `${stamp}-${name}`, f.buffer);
            }
            await this.prisma.satisfactionSurveyFile.create({
                data: { tenantId: this.ctx.tenantId, surveyId, fileName: displayName, storagePath, originalPath, mimeType, sizeBytes: size, sortOrder: order++, createdBy: this.ctx.accountId },
            });
        }
    }
};
exports.SatisfactionService = SatisfactionService;
exports.SatisfactionService = SatisfactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        care_storage_service_1.CareStorageService,
        satisfaction_extraction_service_1.SatisfactionExtractionService,
        ai_gateway_client_1.AiGatewayClient,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], SatisfactionService);
//# sourceMappingURL=satisfaction.service.js.map