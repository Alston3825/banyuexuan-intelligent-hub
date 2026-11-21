import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateCareOutreachTemplateDto } from './dto/create-care-outreach-template.dto';
import { UpdateCareOutreachTemplateDto } from './dto/update-care-outreach-template.dto';
export declare class CareOutreachTemplateService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(): import(".prisma/client").Prisma.PrismaPromise<{}>;
    findOneOrThrow(id: string): unknown;
    create(dto: CreateCareOutreachTemplateDto): unknown;
    update(id: string, dto: UpdateCareOutreachTemplateDto): unknown;
    private auditCtx;
}
