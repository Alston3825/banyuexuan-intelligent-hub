import { ExamQuestionDto } from './exam-question.dto';
export declare class CreateTrainingExamDto {
    title: string;
    studyMaterial?: string;
    passScore?: number;
    questions: ExamQuestionDto[];
}
