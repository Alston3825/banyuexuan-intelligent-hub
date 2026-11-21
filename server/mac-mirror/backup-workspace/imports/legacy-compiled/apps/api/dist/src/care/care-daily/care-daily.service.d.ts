import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CareMedicationService } from '../care-medication/care-medication.service';
export interface FeedingInput {
    [key: string]: unknown;
}
export interface SaveDayDto {
    motherProfileId: string;
    date: string;
    documentId?: string | null;
    version?: number;
    mother: Record<string, unknown>;
    babies: {
        babyProfileId: string;
        values: Record<string, unknown>;
        feedings?: FeedingInput[];
        nursings?: FeedingInput[];
    }[];
}
export declare class CareDailyService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    private readonly medication;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService, medication: CareMedicationService);
    specs(): {
        mother: {};
        baby: {};
        feeding: {};
        nursing: {};
    };
    private mother;
    private startDate;
    private endDate;
    days(motherProfileId: string): unknown;
    private babySummary;
    day(motherProfileId: string, date: string): unknown;
    saveDay(dto: SaveDayDto): unknown;
    pending(storeId: string | undefined, date?: string): unknown;
}
