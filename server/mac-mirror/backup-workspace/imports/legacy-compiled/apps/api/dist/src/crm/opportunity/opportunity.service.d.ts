import { SalesOpportunity } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CustomerService } from '../customer/customer.service';
import { QueryOpportunityDto } from './dto/query-opportunity.dto';
export declare class OpportunityService {
    private readonly prisma;
    private readonly customerService;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, customerService: CustomerService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query: QueryOpportunityDto): Promise<SalesOpportunity[]>;
    findOneOrThrow(id: string): Promise<SalesOpportunity>;
    create(data: {
        customerId: string;
        leadId?: string;
        amount?: number;
        assignedToId?: string;
        remark?: string;
    }): Promise<SalesOpportunity>;
    update(id: string, data: {
        amount?: number;
        assignedToId?: string;
        remark?: string;
    }, expectedVersion: number): Promise<SalesOpportunity>;
    advanceStage(id: string, targetStage: 'QUOTED' | 'WON', expectedVersion: number): Promise<SalesOpportunity>;
    lose(id: string, lostReason: string, expectedVersion: number): Promise<SalesOpportunity>;
    private assertVersion;
    private auditCtx;
}
