import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { FormSpec } from './assessment-specs';
export declare class CareAssessmentService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    specs(): FormSpec[];
    static specOf(type: string): FormSpec;
    private delegate;
    private fkOf;
    overview(motherProfileId: string): unknown;
    private resolveProfile;
    private assertDocument;
    create(type: string, dto: {
        profileId: string;
        documentId?: string;
        values: Record<string, unknown>;
    }): unknown;
    update(type: string, id: string, dto: {
        version: number;
        documentId?: string | null;
        values: Record<string, unknown>;
    }): unknown;
    private syncBabyProfile;
    private confirmDocument;
    private audit;
}
