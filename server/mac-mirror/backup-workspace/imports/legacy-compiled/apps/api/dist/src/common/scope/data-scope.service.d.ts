import { PrismaService } from '../../prisma/prisma.service';
import { RequestContextService } from '../context/request-context.service';
export declare class DataScopeService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    resolveAllowedStoreIds(ctx: RequestContextService): Promise<'ALL' | string[]>;
    assertStoreAccessible(ctx: RequestContextService, storeId?: string | null): Promise<void>;
    hasOnlySelfScope(ctx: RequestContextService): Promise<boolean>;
}
