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
exports.WorkbenchService = void 0;
exports.reminderDueOn = reminderDueOn;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const request_context_service_1 = require("../common/context/request-context.service");
const QUADRANTS = ['Q1', 'Q2', 'Q3', 'Q4'];
const REPEATS = ['NONE', 'DAILY', 'WEEKDAYS', 'WEEKLY', 'MONTHLY'];
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const startOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};
const isYmd = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const parseYmd = (s) => new Date(`${s}T00:00:00`);
function reminderDueOn(r, date) {
    if (date < r.startDate)
        return false;
    const d = parseYmd(date);
    const start = parseYmd(r.startDate);
    switch (r.repeat) {
        case 'NONE':
            return date === r.startDate;
        case 'DAILY':
            return true;
        case 'WEEKDAYS':
            return d.getDay() >= 1 && d.getDay() <= 5;
        case 'WEEKLY':
            return d.getDay() === (r.weekday ?? start.getDay());
        case 'MONTHLY': {
            const want = r.monthDay ?? start.getDate();
            const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            return d.getDate() === Math.min(want, last);
        }
        default:
            return false;
    }
}
let WorkbenchService = class WorkbenchService {
    prisma;
    ctx;
    constructor(prisma, ctx) {
        this.prisma = prisma;
        this.ctx = ctx;
    }
    get me() {
        return { tenantId: this.ctx.tenantId, accountId: this.ctx.accountId };
    }
    clean(s, max, required = false) {
        const v = typeof s === 'string' ? s.trim() : '';
        if (!v && required)
            throw new common_1.BadRequestException('内容不能为空');
        return v ? v.slice(0, max) : null;
    }
    async tasks() {
        return this.prisma.personalTask.findMany({
            where: { ...this.me, OR: [{ done: false }, { doneAt: { gte: startOfToday() } }] },
            orderBy: [{ done: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    async createTask(dto) {
        const quadrant = QUADRANTS.includes(dto.quadrant ?? '') ? dto.quadrant : 'Q2';
        const max = await this.prisma.personalTask.aggregate({ where: { ...this.me, quadrant }, _max: { sortOrder: true } });
        return this.prisma.personalTask.create({ data: { ...this.me, title: this.clean(dto.title, 200, true), note: this.clean(dto.note, 500), quadrant, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
    }
    async updateTask(id, dto) {
        const row = await this.prisma.personalTask.findFirst({ where: { id, ...this.me } });
        if (!row)
            throw new common_1.NotFoundException('任务不存在');
        const data = {};
        if (dto.title !== undefined)
            data.title = this.clean(dto.title, 200, true);
        if (dto.note !== undefined)
            data.note = this.clean(dto.note, 500);
        if (dto.quadrant !== undefined) {
            if (!QUADRANTS.includes(dto.quadrant))
                throw new common_1.BadRequestException('象限不正确');
            if (dto.quadrant !== row.quadrant) {
                const max = await this.prisma.personalTask.aggregate({ where: { ...this.me, quadrant: dto.quadrant }, _max: { sortOrder: true } });
                data.quadrant = dto.quadrant;
                data.sortOrder = (max._max.sortOrder ?? 0) + 1;
            }
        }
        if (dto.done !== undefined) {
            data.done = !!dto.done;
            data.doneAt = dto.done ? new Date() : null;
        }
        return this.prisma.personalTask.update({ where: { id }, data });
    }
    async deleteTask(id) {
        await this.prisma.personalTask.deleteMany({ where: { id, ...this.me } });
        return { ok: true };
    }
    async remindersForDay(date) {
        const day = isYmd(date) ? date : ymd(new Date());
        const rows = await this.prisma.personalReminder.findMany({ where: { ...this.me, active: true }, include: { completions: true } });
        const weekAgo = ymd(new Date(parseYmd(day).getTime() - 7 * 86400_000));
        const out = rows
            .map((r) => {
            const due = reminderDueOn(r, day);
            const overdue = !due && r.repeat === 'NONE' && r.startDate < day && r.startDate >= weekAgo && r.completions.length === 0;
            if (!due && !overdue)
                return null;
            const done = r.completions.some((c) => c.date === (overdue ? r.startDate : day));
            return { id: r.id, title: r.title, note: r.note, timeOfDay: r.timeOfDay, repeat: r.repeat, startDate: r.startDate, overdue, done, date: overdue ? r.startDate : day };
        })
            .filter((x) => !!x);
        out.sort((a, b) => Number(a.done) - Number(b.done) || Number(b.overdue) - Number(a.overdue) || (a.timeOfDay ?? '99:99').localeCompare(b.timeOfDay ?? '99:99'));
        return out;
    }
    async reminderDefs() {
        return this.prisma.personalReminder.findMany({ where: { ...this.me, active: true }, orderBy: [{ createdAt: 'desc' }] });
    }
    reminderData(dto, partial = false) {
        const data = {};
        if (!partial || dto.title !== undefined)
            data.title = this.clean(dto.title, 200, true);
        if (dto.note !== undefined)
            data.note = this.clean(dto.note, 500);
        if (!partial || dto.repeat !== undefined) {
            if (!REPEATS.includes(dto.repeat ?? 'NONE'))
                throw new common_1.BadRequestException('重复方式不正确');
            data.repeat = dto.repeat ?? 'NONE';
        }
        if (!partial || dto.startDate !== undefined) {
            if (!isYmd(dto.startDate))
                throw new common_1.BadRequestException('请选择日期');
            data.startDate = dto.startDate;
        }
        if (dto.timeOfDay !== undefined) {
            if (dto.timeOfDay && !/^([01]\d|2[0-3]):[0-5]\d$/.test(dto.timeOfDay))
                throw new common_1.BadRequestException('时间格式应为 HH:mm');
            data.timeOfDay = dto.timeOfDay || null;
        }
        if (dto.weekday !== undefined)
            data.weekday = dto.weekday === null ? null : Math.min(6, Math.max(0, Number(dto.weekday)));
        if (dto.monthDay !== undefined)
            data.monthDay = dto.monthDay === null ? null : Math.min(31, Math.max(1, Number(dto.monthDay)));
        return data;
    }
    async createReminder(dto) {
        return this.prisma.personalReminder.create({ data: { ...this.me, ...this.reminderData(dto) } });
    }
    async updateReminder(id, dto) {
        const row = await this.prisma.personalReminder.findFirst({ where: { id, ...this.me } });
        if (!row)
            throw new common_1.NotFoundException('提醒不存在');
        return this.prisma.personalReminder.update({ where: { id }, data: this.reminderData(dto, true) });
    }
    async deleteReminder(id) {
        await this.prisma.personalReminder.deleteMany({ where: { id, ...this.me } });
        return { ok: true };
    }
    async markReminder(id, dto) {
        const row = await this.prisma.personalReminder.findFirst({ where: { id, ...this.me } });
        if (!row)
            throw new common_1.NotFoundException('提醒不存在');
        const date = isYmd(dto.date) ? dto.date : ymd(new Date());
        if (dto.done === false)
            await this.prisma.personalReminderDone.deleteMany({ where: { reminderId: id, date } });
        else
            await this.prisma.personalReminderDone.upsert({ where: { reminderId_date: { reminderId: id, date } }, create: { reminderId: id, date }, update: {} });
        return { ok: true };
    }
    async reminderBadge() {
        return (await this.remindersForDay()).filter((r) => !r.done).length;
    }
    async ongoing() {
        return this.prisma.ongoingWork.findMany({
            where: { ...this.me, OR: [{ finished: false }, { finishedAt: { gte: new Date(Date.now() - 7 * 86400_000) } }] },
            include: { steps: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] } },
            orderBy: [{ finished: 'asc' }, { createdAt: 'desc' }],
        });
    }
    async createOngoing(dto) {
        const steps = (Array.isArray(dto.steps) ? dto.steps : []).map((s) => this.clean(s, 200)).filter((s) => !!s);
        return this.prisma.ongoingWork.create({
            data: { ...this.me, title: this.clean(dto.title, 200, true), note: this.clean(dto.note, 500), steps: { create: steps.map((title, i) => ({ title, sortOrder: i + 1 })) } },
            include: { steps: true },
        });
    }
    async ownWork(id) {
        const w = await this.prisma.ongoingWork.findFirst({ where: { id, ...this.me } });
        if (!w)
            throw new common_1.NotFoundException('事项不存在');
        return w;
    }
    async updateOngoing(id, dto) {
        await this.ownWork(id);
        const data = {};
        if (dto.title !== undefined)
            data.title = this.clean(dto.title, 200, true);
        if (dto.note !== undefined)
            data.note = this.clean(dto.note, 500);
        if (dto.finished !== undefined) {
            data.finished = !!dto.finished;
            data.finishedAt = dto.finished ? new Date() : null;
        }
        return this.prisma.ongoingWork.update({ where: { id }, data });
    }
    async deleteOngoing(id) {
        await this.prisma.ongoingWork.deleteMany({ where: { id, ...this.me } });
        return { ok: true };
    }
    async addStep(id, dto) {
        await this.ownWork(id);
        const max = await this.prisma.ongoingWorkStep.aggregate({ where: { workId: id }, _max: { sortOrder: true } });
        return this.prisma.ongoingWorkStep.create({ data: { workId: id, title: this.clean(dto.title, 200, true), sortOrder: (max._max.sortOrder ?? 0) + 1 } });
    }
    async updateStep(id, stepId, dto) {
        await this.ownWork(id);
        const step = await this.prisma.ongoingWorkStep.findFirst({ where: { id: stepId, workId: id } });
        if (!step)
            throw new common_1.NotFoundException('节点不存在');
        const data = {};
        if (dto.title !== undefined)
            data.title = this.clean(dto.title, 200, true);
        if (dto.result !== undefined)
            data.result = this.clean(dto.result, 500);
        if (dto.done !== undefined) {
            data.done = !!dto.done;
            data.doneAt = dto.done ? new Date() : null;
        }
        return this.prisma.ongoingWorkStep.update({ where: { id: stepId }, data });
    }
    async deleteStep(id, stepId) {
        await this.ownWork(id);
        await this.prisma.ongoingWorkStep.deleteMany({ where: { id: stepId, workId: id } });
        return { ok: true };
    }
    async myTheme() {
        const a = await this.prisma.account.findUnique({ where: { id: this.ctx.accountId }, select: { uiTheme: true } });
        return { theme: a?.uiTheme ?? null };
    }
    async saveTheme(dto) {
        const theme = typeof dto.theme === 'string' && /^[a-z0-9_-]{1,32}$/.test(dto.theme) ? dto.theme : null;
        if (!theme)
            throw new common_1.BadRequestException('配色方案不正确');
        await this.prisma.account.update({ where: { id: this.ctx.accountId }, data: { uiTheme: theme } });
        return { theme };
    }
    async links() {
        return this.prisma.quickLink.findMany({ where: this.me, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
    }
    async saveLinks(dto) {
        const list = (Array.isArray(dto.links) ? dto.links : []).filter((l) => typeof l?.path === 'string' && l.path.startsWith('/') && l.path.length <= 200 && typeof l.label === 'string' && l.label.trim());
        const seen = new Set();
        const uniq = list.filter((l) => (seen.has(l.path) ? false : (seen.add(l.path), true))).slice(0, 24);
        await this.prisma.$transaction([
            this.prisma.quickLink.deleteMany({ where: this.me }),
            this.prisma.quickLink.createMany({ data: uniq.map((l, i) => ({ ...this.me, path: l.path, label: l.label.trim().slice(0, 60), sortOrder: i })) }),
        ]);
        return this.links();
    }
};
exports.WorkbenchService = WorkbenchService;
exports.WorkbenchService = WorkbenchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        request_context_service_1.RequestContextService])
], WorkbenchService);
//# sourceMappingURL=workbench.service.js.map