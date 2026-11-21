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
exports.ExamAttemptService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const data_scope_service_1 = require("../../common/scope/data-scope.service");
const sanitizedQuestionSelect = {
    id: true,
    order: true,
    type: true,
    content: true,
    options: true,
    score: true,
};
const attemptInclude = {
    exam: { select: { id: true, title: true, passScore: true } },
    account: { select: { id: true, realName: true, username: true, storeId: true } },
    answers: { include: { question: { select: sanitizedQuestionSelect } } },
};
function isSetEqual(a, b) {
    const arrA = Array.isArray(a) ? [...a].sort() : [a];
    const arrB = Array.isArray(b) ? [...b].sort() : [b];
    return JSON.stringify(arrA) === JSON.stringify(arrB);
}
let ExamAttemptService = class ExamAttemptService {
    prisma;
    auditLogService;
    ctx;
    dataScopeService;
    constructor(prisma, auditLogService, ctx, dataScopeService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
        this.dataScopeService = dataScopeService;
    }
    listAvailableExams() {
        return this.prisma.trainingExam.findMany({
            where: { tenantId: this.ctx.tenantId, status: 'PUBLISHED' },
            select: { id: true, title: true, studyMaterial: true, passScore: true, questions: { select: sanitizedQuestionSelect, orderBy: { order: 'asc' } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getExamForAttemptOrThrow(examId) {
        const exam = await this.prisma.trainingExam.findUnique({
            where: { id: examId },
            select: { id: true, title: true, studyMaterial: true, passScore: true, status: true, questions: { select: sanitizedQuestionSelect, orderBy: { order: 'asc' } } },
        });
        if (!exam)
            throw new common_1.NotFoundException(`TrainingExam ${examId} 不存在`);
        if (exam.status !== 'PUBLISHED')
            throw new common_1.BadRequestException('该试卷未发布，不能作答');
        return exam;
    }
    findMyAttempts() {
        return this.prisma.examAttempt.findMany({
            where: { tenantId: this.ctx.tenantId, accountId: this.ctx.accountId },
            include: attemptInclude,
            orderBy: { submittedAt: 'desc' },
        });
    }
    async findPendingGrading() {
        const allowed = await this.dataScopeService.resolveAllowedStoreIds(this.ctx);
        return this.prisma.examAttempt.findMany({
            where: {
                tenantId: this.ctx.tenantId,
                status: 'PENDING_GRADING',
                account: allowed === 'ALL' ? undefined : { storeId: { in: allowed } },
            },
            include: attemptInclude,
            orderBy: { submittedAt: 'asc' },
        });
    }
    async findOneAttemptOrThrow(id) {
        const attempt = await this.prisma.examAttempt.findUnique({ where: { id, tenantId: this.ctx.tenantId }, include: attemptInclude });
        if (!attempt)
            throw new common_1.NotFoundException(`ExamAttempt ${id} 不存在`);
        return attempt;
    }
    async submit(dto) {
        const exam = await this.prisma.trainingExam.findUnique({ where: { id: dto.examId }, include: { questions: true } });
        if (!exam)
            throw new common_1.NotFoundException(`TrainingExam ${dto.examId} 不存在`);
        if (exam.status !== 'PUBLISHED')
            throw new common_1.BadRequestException('该试卷未发布，不能作答');
        const questionMap = new Map(exam.questions.map((q) => [q.id, q]));
        if (dto.answers.some((a) => !questionMap.has(a.questionId))) {
            throw new common_1.BadRequestException('存在不属于该试卷的题目');
        }
        let autoScore = 0;
        let hasShortAnswer = false;
        const answerRows = dto.answers.map((a) => {
            const question = questionMap.get(a.questionId);
            if (question.type === 'SHORT_ANSWER') {
                hasShortAnswer = true;
                return { questionId: a.questionId, selectedKeys: undefined, textAnswer: a.textAnswer, isCorrect: null, score: 0 };
            }
            const isCorrect = isSetEqual(a.selectedKeys, question.correctAnswer);
            const score = isCorrect ? question.score : 0;
            autoScore += score;
            return { questionId: a.questionId, selectedKeys: a.selectedKeys, textAnswer: undefined, isCorrect, score };
        });
        const created = await this.prisma.$transaction(async (tx) => {
            const attempt = await tx.examAttempt.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    examId: dto.examId,
                    accountId: this.ctx.accountId,
                    autoScore,
                    totalScore: hasShortAnswer ? null : autoScore,
                    status: hasShortAnswer ? 'PENDING_GRADING' : 'COMPLETED',
                    createdBy: this.ctx.accountId,
                },
            });
            await tx.examAnswer.createMany({
                data: answerRows.map((r) => ({ tenantId: this.ctx.tenantId, attemptId: attempt.id, ...r })),
            });
            return attempt;
        });
        const withAnswers = await this.findOneAttemptOrThrow(created.id);
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'ExamAttempt',
            entityId: created.id,
            afterData: withAnswers,
            ...this.auditCtx(),
        });
        return withAnswers;
    }
    async grade(attemptId, dto) {
        const before = await this.findOneAttemptOrThrow(attemptId);
        await this.dataScopeService.assertStoreAccessible(this.ctx, before.account.storeId);
        if (before.status !== 'PENDING_GRADING') {
            throw new common_1.BadRequestException(`该作答当前状态「${before.status}」不允许批阅`);
        }
        const shortAnswerIds = new Set(before.answers.filter((a) => a.question.type === 'SHORT_ANSWER').map((a) => a.id));
        if (dto.answers.some((a) => !shortAnswerIds.has(a.answerId))) {
            throw new common_1.BadRequestException('只能批阅该作答里的简答题');
        }
        await this.prisma.$transaction(async (tx) => {
            for (const a of dto.answers) {
                await tx.examAnswer.update({ where: { id: a.answerId }, data: { score: a.score } });
            }
        });
        const refreshed = await this.findOneAttemptOrThrow(attemptId);
        const manualScore = refreshed.answers.filter((a) => a.question.type === 'SHORT_ANSWER').reduce((sum, a) => sum + a.score, 0);
        const totalScore = refreshed.autoScore + manualScore;
        const updated = await this.prisma.examAttempt.update({
            where: { id: attemptId },
            data: { manualScore, totalScore, status: 'COMPLETED', gradedById: this.ctx.accountId, gradedAt: new Date(), version: { increment: 1 } },
        });
        const withAnswers = await this.findOneAttemptOrThrow(updated.id);
        await this.auditLogService.record({
            action: 'STATE_TRANSITION',
            entityType: 'ExamAttempt',
            entityId: attemptId,
            beforeData: before,
            afterData: withAnswers,
            remark: `PENDING_GRADING -> COMPLETED（简答题批阅完成，总分${totalScore}）`,
            ...this.auditCtx(),
        });
        return withAnswers;
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
exports.ExamAttemptService = ExamAttemptService;
exports.ExamAttemptService = ExamAttemptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService,
        data_scope_service_1.DataScopeService])
], ExamAttemptService);
//# sourceMappingURL=exam-attempt.service.js.map