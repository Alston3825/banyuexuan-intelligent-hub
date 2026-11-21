import { PrismaService } from '../prisma/prisma.service';
import { RequestContextService } from '../common/context/request-context.service';
export declare const DEFAULT_SERVICE_CODES: {};
export declare class IntegrationAdminService {
    private readonly prisma;
    private readonly ctx;
    constructor(prisma: PrismaService, ctx: RequestContextService);
    private get tenantId();
    listSystems(): import(".prisma/client").Prisma.PrismaPromise<{}>;
    private newKey;
    createSystem(dto: {
        code: string;
        name: string;
        baseUrl?: string;
        systemVersion?: string;
        storeId?: string;
        remark?: string;
    }): unknown;
    updateSystem(id: string, dto: {
        name?: string;
        baseUrl?: string;
        systemVersion?: string;
        storeId?: string | null;
        enabled?: boolean;
        remark?: string;
    }): unknown;
    resetKey(id: string): unknown;
    listBindings(storeId?: string, roomId?: string): import(".prisma/client").Prisma.PrismaPromise<{}>;
    addBinding(dto: {
        roomId: string;
        kind: 'TABLET' | 'BEACON';
        deviceCode: string;
        remark?: string;
    }): unknown;
    removeBinding(id: string): unknown;
    listServiceCodes(): unknown;
    upsertServiceCode(dto: {
        serviceCode: string;
        name: string;
        category?: string;
        sortNo?: number;
        status?: 'ACTIVE' | 'INACTIVE';
    }): unknown;
    listCalls(q: {
        storeId?: string;
        roomId?: string;
        stayId?: string;
        from?: string;
        to?: string;
        take?: number;
    }): import(".prisma/client").Prisma.PrismaPromise<{}>;
}
export declare function ensureServiceCodes(prisma: PrismaService, tenantId: string): any;
