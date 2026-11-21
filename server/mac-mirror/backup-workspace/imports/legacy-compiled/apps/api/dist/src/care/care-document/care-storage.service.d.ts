import { ConfigService } from '@nestjs/config';
import { ReadStream } from 'fs';
export declare class CareStorageService {
    private readonly root;
    constructor(config: ConfigService);
    save(documentId: string, fileName: string, data: Buffer): Promise<string>;
    readBuffer(rel: string): Promise<Buffer>;
    readStream(rel: string): Promise<{
        stream: ReadStream;
        size: number;
    }>;
    removeDocumentDir(documentId: string): Promise<void>;
    private resolve;
    static safeName(name: string): string;
}
