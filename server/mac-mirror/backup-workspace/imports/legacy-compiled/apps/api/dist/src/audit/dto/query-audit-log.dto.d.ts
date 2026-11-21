declare const AUDIT_ACTIONS: readonly ["LOGIN", "LOGIN_FAILED", "LOGOUT", "CREATE", "UPDATE", "DELETE", "VOID", "STATE_TRANSITION", "APPROVE", "REJECT", "WITHDRAW", "REASSIGN", "ADD_APPROVER", "CC", "ARCHIVE", "SENSITIVE_QUERY", "EXPORT", "PRINT"];
export declare class QueryAuditLogDto {
    entityType?: string;
    entityId?: string;
    accountId?: string;
    action?: (typeof AUDIT_ACTIONS)[number];
    page?: number;
    pageSize?: number;
}
export {};
