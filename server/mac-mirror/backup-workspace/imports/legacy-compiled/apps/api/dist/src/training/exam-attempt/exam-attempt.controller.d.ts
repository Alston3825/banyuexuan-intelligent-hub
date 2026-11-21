import { ExamAttemptService } from './exam-attempt.service';
import { SubmitExamAttemptDto } from './dto/submit-exam-attempt.dto';
import { GradeExamAttemptDto } from './dto/grade-exam-attempt.dto';
export declare class ExamAttemptController {
    private readonly examAttemptService;
    constructor(examAttemptService: ExamAttemptService);
    listAvailableExams(): any;
    getExamForAttempt(id: string): unknown;
    findMine(): any;
    findPendingGrading(): unknown;
    submit(dto: SubmitExamAttemptDto): unknown;
    findOne(id: string): unknown;
    grade(id: string, dto: GradeExamAttemptDto): unknown;
}
