import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
import { SubmitExamAttemptDto } from './dto/submit-exam-attempt.dto';
import { GradeExamAttemptDto } from './dto/grade-exam-attempt.dto';
export declare class ExamAttemptService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    private readonly dataScopeService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService, dataScopeService: DataScopeService);
    listAvailableExams(): any;
    getExamForAttemptOrThrow(examId: string): unknown;
    findMyAttempts(): any;
    findPendingGrading(): unknown;
    findOneAttemptOrThrow(id: string): unknown;
    submit(dto: SubmitExamAttemptDto): unknown;
    grade(attemptId: string, dto: GradeExamAttemptDto): unknown;
    private auditCtx;
}
