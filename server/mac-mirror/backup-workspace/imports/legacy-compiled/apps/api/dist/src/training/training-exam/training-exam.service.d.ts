import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateTrainingExamDto } from './dto/create-training-exam.dto';
import { UpdateTrainingExamDto } from './dto/update-training-exam.dto';
export declare class TrainingExamService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(): import(".prisma/client").Prisma.PrismaPromise<{}>;
    findOneOrThrow(id: string): unknown;
    create(dto: CreateTrainingExamDto): unknown;
    update(id: string, dto: UpdateTrainingExamDto): unknown;
    private auditCtx;
}
