import { CareDocType } from '@prisma/client';
import type { Response } from 'express';
import { CareDocumentService } from './care-document.service';
declare class UploadCareDocumentDto {
    docType: CareDocType;
    motherProfileId?: string;
    babyProfileId?: string;
    title?: string;
    docDate?: string;
    remark?: string;
    scope?: string;
    autoExtract?: string;
}
declare class QueryCareDocumentDto {
    motherProfileId?: string;
    babyProfileId?: string;
    docType?: CareDocType;
}
declare class UpdateCareDocumentDto {
    title?: string | null;
    docDate?: string | null;
    remark?: string | null;
}
export declare class CareDocumentController {
    private readonly service;
    constructor(service: CareDocumentService);
    list(query: QueryCareDocumentDto): any;
    upload(files: Express.Multer.File[], dto: UploadCareDocumentDto): unknown;
    findOne(id: string): unknown;
    file(id: string, fileId: string, res: Response): unknown;
    addFiles(id: string, files: Express.Multer.File[]): unknown;
    update(id: string, dto: UpdateCareDocumentDto): unknown;
    extract(id: string): unknown;
    remove(id: string): Promise<void>;
}
export {};
