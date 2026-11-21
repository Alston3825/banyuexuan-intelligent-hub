export interface NameFix {
    value: string | null;
    level: 'warn' | null;
    message: string | null;
}
export declare const NURSE_FIELD_KEYS: {};
export declare function editDistance(a: string, b: string): number;
export declare function matchNurseName(raw: unknown, roster: string[]): NameFix;
export declare function applyNurseRoster(data: Record<string, unknown>, roster: string[]): {
    field: string;
    level: 'warn';
    message: string;
}[];
export declare function withRosterHint<T extends {
    key: string;
    aiHint?: string;
    columns?: unknown[];
}>(fields: T[], roster: string[]): T[];
