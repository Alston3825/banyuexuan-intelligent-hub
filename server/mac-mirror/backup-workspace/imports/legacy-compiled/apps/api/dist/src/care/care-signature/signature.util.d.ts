export declare function assertSignatureImage(data: unknown): string;
export declare function contentHash(record: unknown): string;
export declare const sha256: (s: string) => any;
export declare const randomToken: (bytes?: number) => any;
export declare function signToken(payload: Record<string, unknown>, secret: string): string;
export declare function verifyToken<T extends Record<string, unknown>>(token: unknown, secret: string): T | null;
export declare function cleanDeviceId(raw: unknown): string | null;
export declare const maskName: (name: string) => any;
