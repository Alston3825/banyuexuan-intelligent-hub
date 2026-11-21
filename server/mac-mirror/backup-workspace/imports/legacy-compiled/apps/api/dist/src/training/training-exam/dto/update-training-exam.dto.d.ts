import { TrainingExamStatus } from '@prisma/client';
import { ExamQuestionDto } from './exam-question.dto';
export declare class UpdateTrainingExamDto {
    title?: string;
    studyMaterial?: string;
    passScore?: number;
    status?: TrainingExamStatus;
    questions?: ExamQuestionDto[];
    version: number;
}
