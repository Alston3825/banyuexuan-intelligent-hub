import { FollowUpRecord } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { LeadService } from '../lead/lead.service';
export declare class FollowUpService {
    private readonly prisma;
    private readonly leadService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, leadService: LeadService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(businessType: string, businessId: string): Promise<FollowUpRecord[]>;
    create(data: {
        businessType: 'LEAD' | 'OPPORTUNITY' | 'CUSTOMER' | 'CARE_ABNORMALITY';
        businessId: string;
        type: FollowUpRecord['type'];
        content: string;
        nextFollowUpAt?: string;
    }): Promise<FollowUpRecord>;
}
