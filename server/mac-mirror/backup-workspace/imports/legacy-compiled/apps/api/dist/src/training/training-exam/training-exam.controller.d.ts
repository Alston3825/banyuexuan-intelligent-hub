import { TrainingExamService } from './training-exam.service';
import { CreateTrainingExamDto } from './dto/create-training-exam.dto';
import { UpdateTrainingExamDto } from './dto/update-training-exam.dto';
export declare class TrainingExamController {
    private readonly trainingExamService;
    constructor(trainingExamService: TrainingExamService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{}>;
    findOne(id: string): unknown;
    create(dto: CreateTrainingExamDto): unknown;
    update(id: string, dto: UpdateTrainingExamDto): unknown;
}
