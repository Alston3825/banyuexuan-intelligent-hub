import type { Request } from 'express';
import { DataScopeType } from '@prisma/client';
import { PermissionLookupService } from './permission-lookup.service';
export interface ScopeGrant {
    scopeType: DataScopeType;
    scopeId: string | null;
}
export declare class RequestContextService {
    private readonly request;
    private readonly permissionLookup;
    private permissionCodes;
    private scopeGrants;
    constructor(request: Request, permissionLookup: PermissionLookupService);
    get accountId(): string | undefined;
    get tenantId(): string | undefined;
    get homeStoreId(): string | null | undefined;
    get ip(): string | undefined;
    get userAgent(): string | undefined;
    get requestId(): string | undefined;
    private ensureLoaded;
    getPermissionCodes(): Promise<Set<string>>;
    hasPermission(code: string): Promise<boolean>;
    getScopeGrants(): Promise<ScopeGrant[]>;
}
