import { RecycleBinService } from './recycle-bin.service';
export declare class RecycleBinController {
    private readonly service;
    constructor(service: RecycleBinService);
    list(entityType?: string): unknown;
    restore(id: string): Promise<{
        title: string;
        entityType: string;
        entityId: string;
    }>;
    purge(id: string): Promise<void>;
}
