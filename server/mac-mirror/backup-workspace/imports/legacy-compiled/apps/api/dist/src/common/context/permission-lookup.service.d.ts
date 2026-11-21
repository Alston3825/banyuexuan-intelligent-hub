import { PrismaService } from '../../prisma/prisma.service';
import { ScopeGrant } from './request-context.service';
export declare class PermissionLookupService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPermissionCodes(accountId?: string): Promise<Set<string>>;
    getScopeGrants(accountId?: string): Promise<ScopeGrant[]>;
}
