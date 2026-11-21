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
exports.TrainingExamService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const versioned_update_util_1 = require("../../common/utils/versioned-update.util");
const includeQuestions = {
    questions: { orderBy: { order: 'asc' } },
};
let TrainingExamService = class TrainingExamService {
    prisma;
    auditLogService;
    ctx;
    constructor(prisma, auditLogService, ctx) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ctx = ctx;
    }
    findMany() {
        return this.prisma.trainingExam.findMany({
            where: { tenantId: this.ctx.tenantId },
            include: includeQuestions,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneOrThrow(id) {
        const exam = await this.prisma.trainingExam.findUnique({ where: { id }, include: includeQuestions });
        if (!exam)
            throw new common_1.NotFoundException(`TrainingExam ${id} 不存在`);
        return exam;
    }
    async create(dto) {
        const created = await this.prisma.$transaction(async (tx) => {
            const exam = await tx.trainingExam.create({
                data: {
                    tenantId: this.ctx.tenantId,
                    title: dto.title,
                    studyMaterial: dto.studyMaterial,
                    passScore: dto.passScore,
                    createdBy: this.ctx.accountId,
                },
            });
            await tx.examQuestion.createMany({
                data: dto.questions.map((q) => ({
                    tenantId: this.ctx.tenantId,
                    examId: exam.id,
                    order: q.order,
                    type: q.type,
                    content: q.content,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    score: q.score,
                })),
            });
            return exam;
        });
        const withQuestions = await this.findOneOrThrow(created.id);
        await this.auditLogService.record({
            action: 'CREATE',
            entityType: 'TrainingExam',
            entityId: created.id,
            afterData: withQuestions,
            ...this.auditCtx(),
        });
        return withQuestions;
    }
    async update(id, dto) {
        const before = await this.findOneOrThrow(id);
        if (before.version !== dto.version) {
            throw new common_1.ConflictException('数据已被他人修改，请刷新后重试');
        }
        if (dto.questions && before.status !== 'DRAFT') {
            throw new common_1.BadRequestException('试卷已发布，可能已有员工作答，不能整体替换题目列表；如需变更内容请重新创建试卷');
        }
        const updated = await (0, versioned_update_util_1.runVersionedUpdate)(() => this.prisma.$transaction(async (tx) => {
            const exam = await tx.trainingExam.update({
                where: { id, version: dto.version },
                data: {
                    title: dto.title,
                    studyMaterial: dto.studyMaterial,
                    passScore: dto.passScore,
                    status: dto.status,
                    version: { increment: 1 },
                },
            });
            if (dto.questions) {
                await tx.examQuestion.deleteMany({ where: { examId: id } });
                await tx.examQuestion.createMany({
                    data: dto.questions.map((q) => ({
                        tenantId: this.ctx.tenantId,
                        examId: id,
                        order: q.order,
                        type: q.type,
                        content: q.content,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        score: q.score,
                    })),
                });
            }
            return exam;
        }));
        const withQuestions = await this.findOneOrThrow(updated.id);
        await this.auditLogService.record({
            action: 'UPDATE',
            entityType: 'TrainingExam',
            entityId: id,
            beforeData: before,
            afterData: withQuestions,
            changedFields: Object.keys(dto).filter((k) => k !== 'version'),
            ...this.auditCtx(),
        });
        return withQuestions;
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
exports.TrainingExamService = TrainingExamService;
exports.TrainingExamService = TrainingExamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], TrainingExamService);
//# sourceMappingURL=training-exam.service.js.map