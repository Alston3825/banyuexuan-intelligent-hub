import { CareSignShift, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
export declare const CONFIRM_WINDOW_DAYS = 7;
export declare const LINK_TTL_DAYS = 7;
export declare const dayRecordInclude: Prisma.CareDailyRecordInclude;
export type DayRecord = Prisma.CareDailyRecordGetPayload<{
    include: typeof dayRecordInclude;
}>;
export declare function hashDayRecord(rec: DayRecord): string;
export declare class CareSignatureService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly dataScope;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, dataScope: DataScopeService, ctx: RequestContextService);
    mySignature(): unknown;
    setMySignature(data: unknown): unknown;
    private mother;
    private record;
    dayStatus(motherProfileId: string, date: string): unknown;
    overview(motherProfileId: string): unknown;
    sign(input: {
        motherProfileId: string;
        date: string;
        shift: CareSignShift;
        deviceId?: string;
    }): unknown;
    unsign(signatureId: string): unknown;
    createLink(motherProfileId: string): unknown;
    listLinks(motherProfileId: string): unknown;
    revokeLink(id: string): unknown;
}
