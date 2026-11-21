import { CareFormTemplate } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateCareFormTemplateDto } from './dto/create-care-form-template.dto';
import { UpdateCareFormTemplateDto } from './dto/update-care-form-template.dto';
import { QueryCareFormTemplateDto } from './dto/query-care-form-template.dto';
export declare class CareFormTemplateService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryCareFormTemplateDto): Promise<CareFormTemplate[]>;
    findOneOrThrow(id: string): unknown;
    private assertFieldsMatchTarget;
    create(dto: CreateCareFormTemplateDto): unknown;
    update(id: string, dto: UpdateCareFormTemplateDto): unknown;
    private auditCtx;
}
