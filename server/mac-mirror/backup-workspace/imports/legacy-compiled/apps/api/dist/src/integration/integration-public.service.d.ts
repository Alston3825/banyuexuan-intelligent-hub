import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../auth/password.service';
import { PermissionLookupService } from '../common/context/permission-lookup.service';
import { IntegrationCaller } from './api-key.guard';
export declare class IntegrationPublicService {
    private readonly prisma;
    private readonly passwordService;
    private readonly permissionLookup;
    constructor(prisma: PrismaService, passwordService: PasswordService, permissionLookup: PermissionLookupService);
    private storeScope;
    stores(c: IntegrationCaller, since?: string): unknown;
    rooms(c: IntegrationCaller, storeId?: string, since?: string): unknown;
    staff(c: IntegrationCaller, storeId?: string, since?: string): unknown;
    stays(c: IntegrationCaller, storeId?: string, since?: string, status?: string): unknown;
    serviceCodes(c: IntegrationCaller): unknown;
    events(c: IntegrationCaller, storeId?: string, afterSeq?: string): unknown;
    ingestCall(c: IntegrationCaller, dto: Record<string, any>): unknown;
    verifyAuth(c: IntegrationCaller, username: string, password: string): unknown;
}
