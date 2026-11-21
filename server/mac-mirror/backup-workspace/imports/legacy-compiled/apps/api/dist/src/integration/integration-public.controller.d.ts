import { IntegrationCaller } from './api-key.guard';
import { IntegrationPublicService } from './integration-public.service';
export declare class IntegrationPublicController {
    private readonly svc;
    constructor(svc: IntegrationPublicService);
    ping(req: {
        integration: IntegrationCaller;
    }): {
        ok: boolean;
        system: string;
        serverTime: any;
    };
    stores(req: {
        integration: IntegrationCaller;
    }, since?: string): unknown;
    rooms(req: {
        integration: IntegrationCaller;
    }, storeId?: string, since?: string): unknown;
    staff(req: {
        integration: IntegrationCaller;
    }, storeId?: string, since?: string): unknown;
    stays(req: {
        integration: IntegrationCaller;
    }, storeId?: string, since?: string, status?: string): unknown;
    serviceCodes(req: {
        integration: IntegrationCaller;
    }): unknown;
    events(req: {
        integration: IntegrationCaller;
    }, storeId?: string, afterSeq?: string): unknown;
    callEvents(req: {
        integration: IntegrationCaller;
    }, body: Record<string, any>): unknown;
    verify(req: {
        integration: IntegrationCaller;
    }, body: {
        username: string;
        password: string;
    }): unknown;
}
