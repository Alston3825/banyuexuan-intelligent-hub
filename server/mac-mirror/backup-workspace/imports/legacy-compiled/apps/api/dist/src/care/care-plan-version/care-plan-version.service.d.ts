import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
export interface PlanBody {
    motherProfileId?: string;
    babyProfileId?: string | null;
    level?: string;
    source?: string;
    assessmentSummary?: string | null;
    focusPoints?: string | null;
    measures?: {
        title?: string;
        content?: string;
        frequency?: string;
    }[];
    progressNote?: string | null;
    adjustReason?: string | null;
    directActivate?: boolean;
    version?: number;
}
export declare class CarePlanVersionService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    standards(): unknown;
    private me;
    list(motherProfileId: string): any;
    private getOrThrow;
    private cleanMeasures;
    private assertCanApprove;
    create(dto: PlanBody): unknown;
    update(id: string, dto: PlanBody): unknown;
    submit(id: string, version: number): unknown;
    approve(id: string, version: number, comment?: string): unknown;
    reject(id: string, version: number, comment: string): unknown;
    due(storeId?: string): unknown;
    activeForMothers(motherProfileIds: string[]): unknown;
    private audit;
}
export interface ServiceLogBody {
    motherProfileId: string;
    babyProfileId?: string | null;
    serviceCode: string;
    doneDate?: string;
    doneTime?: string;
    systolic?: number;
    diastolic?: number;
    heartRate?: number;
    weightKg?: number;
    doneByName?: string;
    clientSigned?: boolean;
    note?: string;
}
export declare class CareServiceLogService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    private readonly plans;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService, plans: CarePlanVersionService);
    private mother;
    summary(motherProfileId: string): unknown;
    create(dto: ServiceLogBody): unknown;
    toggleDay(dto: {
        motherProfileId: string;
        babyProfileId?: string | null;
        serviceCode: string;
        date: string;
        done: boolean;
    }): unknown;
    importPreview(documentId: string, babyProfileId?: string | null): unknown;
    private validateMeasure;
    importCommit(input: {
        documentId: string;
        babyProfileId?: string | null;
        items: {
            serviceCode: string;
            date: string;
            time?: string | null;
            systolic?: number | null;
            diastolic?: number | null;
            heartRate?: number | null;
            weightKg?: number | null;
            doneByName?: string | null;
            clientSigned?: boolean;
        }[];
    }): unknown;
    remove(id: string): any;
    get planService(): CarePlanVersionService;
}
