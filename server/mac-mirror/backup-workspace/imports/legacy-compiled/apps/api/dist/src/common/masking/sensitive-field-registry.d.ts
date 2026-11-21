export interface SensitiveFieldRule {
    field: string;
    permissionCode: string;
    mask: (value: unknown) => unknown;
}
export declare const SENSITIVE_FIELD_REGISTRY: Record<string, SensitiveFieldRule[]>;
