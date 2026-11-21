import { CareAbnormality, CareRecord } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateCareRecordDto } from './dto/create-care-record.dto';
import { QueryCareRecordDto } from './dto/query-care-record.dto';
export declare class CareRecordService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryCareRecordDto): any;
    findOneOrThrow(id: string): unknown;
    private validateValuesAgainstTemplate;
    private detectAbnormalFields;
    create(dto: CreateCareRecordDto): Promise<{
        record: CareRecord;
        abnormalities: CareAbnormality[];
    }>;
    private auditCtx;
}
