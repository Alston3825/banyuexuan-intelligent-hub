import { PrismaService } from '../../prisma/prisma.service';
import { RequestContextService } from '../../common/context/request-context.service';
export declare class WorkflowQueryService {
    private readonly prisma;
    private readonly ctx;
    constructor(prisma: PrismaService, ctx: RequestContextService);
    private names;
    progress(instanceId: string): unknown;
    instanceIdByBusiness(businessType: string, businessId: string): Promise<string | null>;
    pendingForMe(limit?: number): unknown;
    approvals(tab: 'pending' | 'done' | 'mine' | 'cc', keyword?: string): unknown;
}
