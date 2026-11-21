import type { Response } from 'express';
import { SatisfactionService, SurveyPatch } from './satisfaction.service';
declare class FilterDto {
    templateId?: string;
    from?: string;
    to?: string;
    storeId?: string;
    steward?: string;
    status?: string;
    keyword?: string;
}
declare class CreateDto {
    templateId: string;
    customerId?: string;
}
declare class PatchDto implements SurveyPatch {
    customerId?: string | null;
    customerName?: string | null;
    roomNo?: string | null;
    stewardName?: string | null;
    nurseName?: string | null;
    phone?: string | null;
    surveyDate?: string | null;
    scores?: Record<string, number | null>;
    suggestion?: string | null;
    praise?: string | null;
}
export declare class SatisfactionController {
    private readonly service;
    constructor(service: SatisfactionService);
    specs(): unknown;
    stats(q: FilterDto): unknown;
    comments(q: FilterDto): unknown;
    summarize(q: FilterDto): unknown;
    list(q: FilterDto): unknown;
    create(files: Express.Multer.File[], dto: CreateDto): unknown;
    findOne(id: string): unknown;
    file(id: string, fileId: string, res: Response): unknown;
    addFiles(id: string, files: Express.Multer.File[]): unknown;
    update(id: string, dto: PatchDto): unknown;
    confirm(id: string): unknown;
    unconfirm(id: string): unknown;
    extract(id: string): unknown;
    remove(id: string): any;
}
export {};
