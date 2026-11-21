import { IntegrationAdminService } from './integration-admin.service';
export declare class IntegrationAdminController {
    private readonly svc;
    constructor(svc: IntegrationAdminService);
    systems(): import(".prisma/client").Prisma.PrismaPromise<{}>;
    createSystem(dto: any): unknown;
    updateSystem(id: string, dto: any): unknown;
    resetKey(id: string): unknown;
    bindings(storeId?: string, roomId?: string): import(".prisma/client").Prisma.PrismaPromise<{}>;
    addBinding(dto: any): unknown;
    removeBinding(id: string): unknown;
    serviceCodes(): unknown;
    upsertServiceCode(dto: any): unknown;
    calls(q: any): import(".prisma/client").Prisma.PrismaPromise<{}>;
}
