import { CareAbnormality } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { FollowUpService } from '../../crm/follow-up/follow-up.service';
import { QueryCareAbnormalityDto } from './dto/query-care-abnormality.dto';
import { FollowUpCareAbnormalityDto } from './dto/follow-up-care-abnormality.dto';
import { ResolveCareAbnormalityDto } from './dto/resolve-care-abnormality.dto';
export declare class CareAbnormalityService {
    private readonly prisma;
    private readonly followUpService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, followUpService: FollowUpService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryCareAbnormalityDto): any;
    findOneOrThrow(id: string): Promise<CareAbnormality>;
    getFollowUps(id: string): Promise<{}>;
    follow(id: string, dto: FollowUpCareAbnormalityDto): unknown;
    resolve(id: string, dto: ResolveCareAbnormalityDto): Promise<CareAbnormality>;
    ignore(id: string, dto: ResolveCareAbnormalityDto): Promise<CareAbnormality>;
    private transitionToTerminal;
    private auditCtx;
}
