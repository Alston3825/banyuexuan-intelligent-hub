import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
export interface GrowthPoint {
    date: string;
    ageDays: number;
    ageMonths: number | null;
    value: number;
    source: 'GROWTH' | 'DAILY' | 'BIRTH' | 'ADMISSION';
    recordId?: string;
    rating: string | null;
    pctText: string | null;
    row: number[] | null;
}
export declare class CareGrowthService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    private baby;
    buildReport(babyId: string, tenantId: string, standardRaw?: string): unknown;
    report(babyId: string, standard?: string): unknown;
    addRecord(dto: {
        babyProfileId: string;
        measuredAt: string;
        weightG?: number | null;
        lengthCm?: number | null;
        headCm?: number | null;
        note?: string | null;
    }): unknown;
    removeRecord(id: string): any;
    createShare(babyId: string): unknown;
    revokeShares(babyId: string): unknown;
    publicReport(token: string, standard?: string): unknown;
}
