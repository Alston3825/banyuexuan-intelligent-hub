import { ScheduleEntry } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateScheduleEntryDto } from './dto/create-schedule-entry.dto';
import { UpdateScheduleEntryDto } from './dto/update-schedule-entry.dto';
import { QueryScheduleEntryDto } from './dto/query-schedule-entry.dto';
export declare class ScheduleEntryService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryScheduleEntryDto): any;
    findOneOrThrow(id: string): unknown;
    create(dto: CreateScheduleEntryDto): Promise<ScheduleEntry>;
    update(id: string, dto: UpdateScheduleEntryDto): Promise<ScheduleEntry>;
    delete(id: string): Promise<void>;
    private auditCtx;
}
