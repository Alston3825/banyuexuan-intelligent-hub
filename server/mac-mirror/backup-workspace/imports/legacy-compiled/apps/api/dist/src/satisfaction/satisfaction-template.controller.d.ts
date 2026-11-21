import { SatisfactionTemplateService, TemplateInput } from './satisfaction-template.service';
declare class TemplateDto implements TemplateInput {
    name?: string;
    day?: number | null;
    goodWord?: string;
    badWord?: string;
    suggestionLabel?: string;
    praiseLabel?: string;
    groups?: unknown;
    status?: 'ACTIVE' | 'INACTIVE';
    version?: number;
}
export declare class SatisfactionTemplateController {
    private readonly service;
    constructor(service: SatisfactionTemplateService);
    list(): unknown;
    create(dto: TemplateDto): unknown;
    importFile(file: Express.Multer.File): unknown;
    findOne(id: string): unknown;
    update(id: string, dto: TemplateDto): unknown;
    duplicate(id: string): unknown;
    remove(id: string): any;
}
export {};
