import { ExamQuestionType } from '@prisma/client';
export declare class ExamQuestionDto {
    order: number;
    type: ExamQuestionType;
    content: string;
    options?: {
        key: string;
        text: string;
    }[];
    correctAnswer?: unknown;
    score: number;
}
