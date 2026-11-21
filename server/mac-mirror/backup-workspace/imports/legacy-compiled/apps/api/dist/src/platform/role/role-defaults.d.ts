export interface RoleDefault {
    code: string;
    name: string;
    description: string;
    perms?: string[];
    derive?: (allCodes: string[]) => string[];
}
export declare const DEFAULT_ROLES: RoleDefault[];
export declare function resolveDefaultCodes(roleCode: string, allCodes: string[]): string[] | undefined;
