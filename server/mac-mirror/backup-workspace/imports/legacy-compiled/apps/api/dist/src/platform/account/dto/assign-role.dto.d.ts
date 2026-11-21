declare const SCOPE_TYPES: readonly ["TENANT", "REGION", "STORE", "DEPARTMENT", "TEAM", "SELF"];
export declare class AssignRoleDto {
    roleId: string;
    scopeType: (typeof SCOPE_TYPES)[number];
    scopeId?: string;
    scopeIds?: string[];
}
export {};
