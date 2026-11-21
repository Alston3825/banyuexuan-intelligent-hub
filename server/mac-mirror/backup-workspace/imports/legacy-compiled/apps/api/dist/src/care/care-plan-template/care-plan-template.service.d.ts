import { CarePlanTemplate } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateCarePlanTemplateDto } from './dto/create-care-plan-template.dto';
import { UpdateCarePlanTemplateDto } from './dto/update-care-plan-template.dto';
import { QueryCarePlanTemplateDto } from './dto/query-care-plan-template.dto';
export declare class CarePlanTemplateService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryCarePlanTemplateDto): Promise<CarePlanTemplate[]>;
    findOneOrThrow(id: string): unknown;
    private assertItemsValid;
    create(dto: CreateCarePlanTemplateDto): unknown;
    update(id: string, dto: UpdateCarePlanTemplateDto): unknown;
    private auditCtx;
}
