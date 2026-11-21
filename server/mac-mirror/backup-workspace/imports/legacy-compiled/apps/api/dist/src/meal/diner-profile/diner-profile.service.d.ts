import { DinerProfile } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateDinerProfileDto } from './dto/create-diner-profile.dto';
import { QueryDinerProfileDto } from './dto/query-diner-profile.dto';
export declare class DinerProfileService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryDinerProfileDto): Promise<DinerProfile[]>;
    findOneOrThrow(id: string): unknown;
    create(dto: CreateDinerProfileDto): Promise<DinerProfile>;
    end(id: string): Promise<DinerProfile>;
    private auditCtx;
}
