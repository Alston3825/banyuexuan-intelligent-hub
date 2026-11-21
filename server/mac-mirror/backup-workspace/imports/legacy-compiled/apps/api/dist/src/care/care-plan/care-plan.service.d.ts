import { CarePlan } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateCarePlanDto } from './dto/create-care-plan.dto';
import { QueryCarePlanDto } from './dto/query-care-plan.dto';
export declare class CarePlanService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryCarePlanDto): any;
    findOneOrThrow(id: string): unknown;
    create(dto: CreateCarePlanDto): Promise<CarePlan>;
    terminate(id: string, reason: string, expectedVersion: number): Promise<CarePlan>;
    private auditCtx;
}
