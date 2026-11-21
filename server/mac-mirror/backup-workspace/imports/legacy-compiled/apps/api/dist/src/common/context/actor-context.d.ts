export interface ActorContext {
    accountId?: string;
    tenantId?: string | null;
    storeId?: string | null;
    ip?: string;
    userAgent?: string;
    requestId?: string;
}
export declare const SYSTEM_ACTOR: ActorContext;
