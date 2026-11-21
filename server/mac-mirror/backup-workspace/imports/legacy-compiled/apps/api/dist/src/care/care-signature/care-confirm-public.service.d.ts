import { ConfigService } from '@nestjs/config';
import { CareConfirmMethod } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
export declare class CareConfirmPublicService {
    private readonly prisma;
    private readonly config;
    private readonly auditLogService;
    constructor(prisma: PrismaService, config: ConfigService, auditLogService: AuditLogService);
    private get secret();
    private linkByToken;
    info(token: string): unknown;
    verify(token: string, phoneLast4: string): unknown;
    private sessionLink;
    private recordsInWindow;
    days(token: string, session: string | undefined): unknown;
    confirm(token: string, session: string | undefined, body: {
        viewToken: string;
        items: {
            date: string;
            satisfaction: number;
            comment?: string;
            nurseRatings?: {
                signatureId: string;
                score: number;
            }[];
        }[];
        method: CareConfirmMethod;
        signatureData?: string;
        holdMs?: number;
        deviceId?: string;
        acknowledged?: boolean;
    }, meta: {
        ip?: string;
        userAgent?: string;
    }): unknown;
}
