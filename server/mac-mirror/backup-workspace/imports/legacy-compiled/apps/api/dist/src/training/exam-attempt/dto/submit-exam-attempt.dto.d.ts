export declare class ExamAnswerInputDto {
    questionId: string;
    selectedKeys?: unknown;
    textAnswer?: string;
}
export declare class SubmitExamAttemptDto {
    examId: string;
    answers: ExamAnswerInputDto[];
}
