import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
export interface MedicationDto {
    motherProfileId?: string;
    babyProfileId?: string;
    previousAuthId?: string;
    changeNote?: string;
    documentId?: string | null;
    version?: number;
    header: Record<string, unknown>;
    items: Record<string, unknown>[];
}
export declare class CareMedicationService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    specs(): {
        header: {};
        item: {};
    };
    list(query: {
        motherProfileId?: string;
        babyProfileId?: string;
    }): any;
    private getOrThrow;
    activeItems(babyIds: string[], date: string): unknown;
    private parseItems;
    private assertDocument;
    private confirmDoc;
    create(dto: MedicationDto): unknown;
    update(id: string, dto: MedicationDto): unknown;
    stop(id: string, dto: {
        version: number;
        note: string;
    }): unknown;
    private audit;
}
