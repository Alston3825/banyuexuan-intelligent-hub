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
exports.SatisfactionTemplateService = exports.toSpec = void 0;
exports.ensureDefaultTemplates = ensureDefaultTemplates;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../audit/audit-log.service");
const request_context_service_1 = require("../common/context/request-context.service");
const ai_gateway_client_1 = require("../ai/ai-gateway/ai-gateway.client");
const docx_reader_1 = require("../common/utils/docx-reader");
const xlsx_reader_1 = require("../common/utils/xlsx-reader");
const survey_specs_1 = require("./survey-specs");
const toSpec = (t) => ({
    id: t.id,
    name: t.name,
    sortNo: t.sortNo,
    day: t.day,
    goodWord: t.goodWord,
    badWord: t.badWord,
    groups: t.groups ?? [],
    suggestionLabel: t.suggestionLabel,
    praiseLabel: t.praiseLabel,
});
exports.toSpec = toSpec;
async function ensureDefaultTemplates(prisma, tenantId, accountId) {
    if ((await prisma.satisfactionTemplate.count({ where: { tenantId } })) === 0) {
        for (const d of survey_specs_1.DEFAULT_TEMPLATES) {
            await prisma.satisfactionTemplate.create({
                data: { tenantId, name: d.name, sortNo: d.sortNo, day: d.day, goodWord: d.goodWord, badWord: d.badWord, suggestionLabel: d.suggestionLabel, praiseLabel: d.praiseLabel, groups: d.groups, status: 'ACTIVE', source: 'BUILTIN', createdBy: accountId },
            });
        }
    }
    const orphan = await prisma.satisfactionSurvey.count({ where: { tenantId, templateId: null } });
    if (orphan > 0) {
        const builtin = await prisma.satisfactionTemplate.findMany({ where: { tenantId, source: 'BUILTIN' } });
        for (const t of builtin)
            await prisma.satisfactionSurvey.updateMany({ where: { tenantId, templateId: null, formNo: t.sortNo }, data: { templateId: t.id } });
    }
}
const MAX_ITEMS = 60;
let SatisfactionTemplateService = class SatisfactionTemplateService {
    prisma;
    aiGateway;
    auditLogService;
    ctx;
    constructor(prisma, aiGateway, auditLogService, ctx) {
        this.prisma = prisma;
        this.aiGateway = aiGateway;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    async list() {
        await ensureDefaultTemplates(this.prisma, this.ctx.tenantId, this.ctx.accountId);
        const rows = await this.prisma.satisfactionTemplate.findMany({ where: { tenantId: this.ctx.tenantId }, orderBy: [{ status: 'asc' }, { sortNo: 'asc' }, { createdAt: 'asc' }] });
        const counts = await this.prisma.satisfactionSurvey.groupBy({ by: ['templateId'], where: { tenantId: this.ctx.tenantId, templateId: { not: null } }, _count: { _all: true } });
        const byId = new Map(counts.map((c) => [c.templateId, c._count._all]));
        return rows.map((t) => ({ ...(0, exports.toSpec)(t), status: t.status, source: t.source, version: t.version, surveyCount: byId.get(t.id) ?? 0, itemCount: (0, survey_specs_1.formItems)((0, exports.toSpec)(t)).length }));
    }
    async getOne(id) {
        const t = await this.prisma.satisfactionTemplate.findFirst({ where: { id, tenantId: this.ctx.tenantId } });
        if (!t)
            throw new common_1.NotFoundException('模板不存在');
        return t;
    }
    build(input, current) {
        const name = (input.name ?? current?.name ?? '').trim();
        if (!name)
            throw new common_1.BadRequestException('请填写模板名称');
        const groups = (0, survey_specs_1.normalizeGroups)(input.groups ?? current?.groups);
        if (groups.length === 0)
            throw new common_1.BadRequestException('至少要有一个分组、一道评分题目');
        if (groups.flatMap((g) => g.items).length > MAX_ITEMS)
            throw new common_1.BadRequestException(`评分题目最多 ${MAX_ITEMS} 道`);
        const day = input.day === undefined ? current?.day ?? null : input.day;
        if (day !== null && (!Number.isInteger(day) || day < 1 || day > 365))
            throw new common_1.BadRequestException('“入住第几天”要填 1~365 的整数，不需要自动提醒就留空');
        return {
            name,
            day,
            goodWord: (input.goodWord ?? current?.goodWord ?? '好').trim() || '好',
            badWord: (input.badWord ?? current?.badWord ?? '不好').trim() || '不好',
            suggestionLabel: (input.suggestionLabel ?? current?.suggestionLabel ?? '您的其它意见和建议').trim() || '您的其它意见和建议',
            praiseLabel: (input.praiseLabel ?? current?.praiseLabel ?? '值得您表扬的人、事、物').trim() || '值得您表扬的人、事、物',
            groups: groups,
        };
    }
    async create(input, source = 'MANUAL') {
        await ensureDefaultTemplates(this.prisma, this.ctx.tenantId, this.ctx.accountId);
        const data = this.build(input);
        const max = await this.prisma.satisfactionTemplate.aggregate({ where: { tenantId: this.ctx.tenantId }, _max: { sortNo: true } });
        const created = await this.prisma.satisfactionTemplate.create({
            data: { tenantId: this.ctx.tenantId, ...data, sortNo: (max._max.sortNo ?? 0) + 1, status: input.status ?? (source === 'UPLOAD' ? 'INACTIVE' : 'ACTIVE'), source, createdBy: this.ctx.accountId },
        });
        await this.audit('CREATE', created.id, { name: created.name, source });
        return this.getOne(created.id);
    }
    async update(id, input) {
        const cur = await this.getOne(id);
        if (input.version !== undefined && input.version !== cur.version)
            throw new common_1.ConflictException('模板已被他人修改，请刷新后重试');
        const data = this.build(input, cur);
        const status = input.status ?? cur.status;
        await this.prisma.satisfactionTemplate.update({ where: { id }, data: { ...data, status, version: { increment: 1 } } });
        await this.audit('UPDATE', id, { name: data.name, status });
        return this.getOne(id);
    }
    async duplicate(id) {
        const cur = await this.getOne(id);
        return this.create({ name: `${cur.name}（副本）`, day: cur.day, goodWord: cur.goodWord, badWord: cur.badWord, suggestionLabel: cur.suggestionLabel, praiseLabel: cur.praiseLabel, groups: cur.groups, status: 'INACTIVE' });
    }
    async remove(id) {
        const cur = await this.getOne(id);
        const used = await this.prisma.satisfactionSurvey.count({ where: { templateId: id } });
        if (used > 0)
            throw new common_1.ConflictException(`已经有 ${used} 份调查用了这个模板，不能删除，可以改成“停用”`);
        await this.prisma.satisfactionTemplate.delete({ where: { id } });
        await this.audit('DELETE', id, { name: cur.name });
    }
    async importFile(file) {
        if (!file)
            throw new common_1.BadRequestException('请选择要上传的文件');
        const name = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const ext = (name.split('.').pop() ?? '').toLowerCase();
        const isPdf = file.buffer.subarray(0, 4).toString() === '%PDF';
        const isImage = /^image\//i.test(file.mimetype) || /\.(jpe?g|png|webp|hei[cf])$/i.test(name);
        let parsed;
        if (isPdf || isImage)
            parsed = await this.parseByVision(file, name);
        else if (ext === 'docx')
            parsed = await this.parseByText((0, docx_reader_1.readDocxText)(file.buffer), name);
        else if (ext === 'xlsx')
            parsed = await this.parseByText(this.xlsxText(file.buffer), name);
        else if (ext === 'txt' || ext === 'csv' || ext === 'md')
            parsed = await this.parseByText(file.buffer.toString('utf8'), name);
        else if (ext === 'doc' || ext === 'xls')
            throw new common_1.BadRequestException('不支持老版本的 .doc / .xls 文件，请在 Word/Excel 里“另存为” .docx / .xlsx 再上传');
        else
            throw new common_1.BadRequestException('支持 Word(.docx)、Excel(.xlsx)、PDF、图片（JPG/PNG/HEIC）和文本文件');
        const groups = (0, survey_specs_1.normalizeGroups)(parsed.groups);
        if (groups.length === 0)
            throw new common_1.BadRequestException('没有从文件里读出评分题目，请换一份文件，或点“新建模板”手工填写');
        const base = (parsed.name || name.replace(/\.[^.]+$/, '')).trim() || '新满意度模板';
        return this.create({ name: base, goodWord: parsed.goodWord, badWord: parsed.badWord, suggestionLabel: parsed.suggestionLabel, praiseLabel: parsed.praiseLabel, groups, status: 'INACTIVE' }, 'UPLOAD');
    }
    xlsxText(buf) {
        return (0, xlsx_reader_1.readXlsx)(buf)
            .map((s) => s.rows.map((r) => r.map((c) => (c === null ? '' : String(c).trim())).join(' | ').replace(/(\s*\|\s*)+$/, '')).filter((l) => l.replace(/\|/g, '').trim()).join('\n'))
            .join('\n')
            .slice(0, 30000);
    }
    async parseByVision(file, name) {
        const res = await this.aiGateway.extractCareForm((0, survey_specs_1.templateImportAiSpec)(), [{ name, data: file.buffer }]);
        const d = res.data;
        const rows = Array.isArray(d.items) ? d.items : [];
        const order = [];
        const byGroup = new Map();
        for (const r of rows) {
            const label = String(r?.label ?? '').trim();
            if (!label)
                continue;
            const g = String(r?.group ?? '').trim() || '评分项';
            if (!byGroup.has(g)) {
                byGroup.set(g, []);
                order.push(g);
            }
            byGroup.get(g).push({ label });
        }
        const str = (k) => (typeof d[k] === 'string' && d[k].trim() ? d[k].trim() : undefined);
        return { name: str('title'), goodWord: str('goodWord'), badWord: str('badWord'), suggestionLabel: str('suggestionLabel'), praiseLabel: str('praiseLabel'), groups: order.map((g) => ({ title: g, items: byGroup.get(g) })) };
    }
    async parseByText(text, fileName) {
        const body = text.trim().slice(0, 30000);
        if (!body)
            throw new common_1.BadRequestException('文件里没有读到文字内容');
        const prompt = [
            '下面是一份客户满意度调查表/问卷的文字内容（表格行用“ | ”隔开）。请读出它的结构，只输出一个 JSON 对象，不要任何解释，格式：',
            '{"name":"表格标题","goodWord":"评分尺好的一端的词，如 好/合理/满意，没有就写 好","badWord":"评分尺差的一端的词，如 不好/不合理/不满意，没有就写 不好","suggestionLabel":"手写意见栏的名称，没有就写 您的其它意见和建议","praiseLabel":"表扬栏名称，没有就写 值得您表扬的人、事、物","groups":[{"title":"分组标题","items":["题目1","题目2"]}]}',
            '要求：groups 里放需要客户打分（勾选分值、星级、满意程度等）的评分题目，按原文顺序，题目文字保留原文、去掉序号；没有分组标题就用“评分项”；手写意见栏、姓名/房号/日期等信息栏不是评分题目，不要放进 groups；不要编造原文没有的题目。',
            `文件名：${fileName}`,
            '【内容开始】',
            body,
            '【内容结束】',
        ].join('\n');
        const res = await this.aiGateway.complete([{ role: 'user', content: prompt }]);
        const m = res.content.match(/\{[\s\S]*\}/);
        if (!m)
            throw new common_1.BadRequestException('AI 没有读出模板结构，请重试，或点“新建模板”手工填写');
        let j;
        try {
            j = JSON.parse(m[0]);
        }
        catch {
            throw new common_1.BadRequestException('AI 返回的内容格式不对，请重试，或点“新建模板”手工填写');
        }
        const groups = (Array.isArray(j.groups) ? j.groups : []).map((g) => ({ title: String(g?.title ?? ''), items: (Array.isArray(g?.items) ? g.items : []).map((it) => ({ label: typeof it === 'string' ? it : String(it?.label ?? '') })) }));
        const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
        return { name: str(j.name), goodWord: str(j.goodWord), badWord: str(j.badWord), suggestionLabel: str(j.suggestionLabel), praiseLabel: str(j.praiseLabel), groups };
    }
    async audit(action, id, data) {
        await this.auditLogService.record({
            action,
            entityType: 'SatisfactionTemplate',
            entityId: id,
            afterData: data,
            tenantId: this.ctx.tenantId,
            accountId: this.ctx.accountId,
            ip: this.ctx.ip,
            userAgent: this.ctx.userAgent,
            requestId: this.ctx.requestId,
        });
    }
};
exports.SatisfactionTemplateService = SatisfactionTemplateService;
exports.SatisfactionTemplateService = SatisfactionTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_gateway_client_1.AiGatewayClient,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], SatisfactionTemplateService);
//# sourceMappingURL=satisfaction-template.service.js.map