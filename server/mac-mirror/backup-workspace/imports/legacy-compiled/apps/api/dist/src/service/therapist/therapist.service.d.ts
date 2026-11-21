import { Therapist } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { QueryTherapistDto } from './dto/query-therapist.dto';
export declare class TherapistService extends BaseScopedCrudService<Therapist> {
    private readonly prisma;
    protected readonly entityType = "Therapist";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(query?: QueryTherapistDto): Promise<Therapist[]>;
    create(data: {
        storeId: string;
        name: string;
        phone?: string;
    }): Promise<T>;
}
