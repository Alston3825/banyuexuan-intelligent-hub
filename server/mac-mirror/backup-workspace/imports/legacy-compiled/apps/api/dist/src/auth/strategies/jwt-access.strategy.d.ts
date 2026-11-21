import { ConfigService } from '@nestjs/config';
export interface JwtAccessPayload {
    sub: string;
    tenantId: string;
    storeId?: string | null;
}
declare const JwtAccessStrategy_base: any;
export declare class JwtAccessStrategy extends JwtAccessStrategy_base {
    constructor(configService: ConfigService);
    validate(payload: JwtAccessPayload): {
        accountId: string;
        tenantId: string;
        storeId: string | null;
    };
}
export {};
