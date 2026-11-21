import { ConfigService } from '@nestjs/config';
import { ReadStream } from 'fs';
export declare class ContractStorageService {
    private readonly root;
    constructor(config: ConfigService);
    save(contractId: string, subDir: 'orig' | 'pages', fileName: string, data: Buffer): Promise<string>;
    readBuffer(rel: string): Promise<Buffer>;
    removePagesDir(contractId: string): Promise<void>;
    readStream(rel: string): Promise<{
        stream: ReadStream;
        size: number;
    }>;
    removeContractDir(contractId: string): Promise<void>;
    private resolve;
    static safeName(name: string): string;
}
