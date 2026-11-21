import { MealPlanTemplate } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateMealPlanTemplateDto } from './dto/create-meal-plan-template.dto';
import { UpdateMealPlanTemplateDto } from './dto/update-meal-plan-template.dto';
export declare class MealPlanTemplateService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(): any;
    findOneOrThrow(id: string): unknown;
    private assertItemsValid;
    create(dto: CreateMealPlanTemplateDto): Promise<MealPlanTemplate>;
    update(id: string, dto: UpdateMealPlanTemplateDto): Promise<MealPlanTemplate>;
    private auditCtx;
}
