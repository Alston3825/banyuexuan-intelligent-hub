import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export interface IntegrationCaller {
    systemId: string;
    code: string;
    tenantId: string;
    storeId: string | null;
}
export declare const hashApiKey: (key: string) => any;
export declare class ApiKeyGuard implements CanActivate {
    private readonly prisma;
    constructor(prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
