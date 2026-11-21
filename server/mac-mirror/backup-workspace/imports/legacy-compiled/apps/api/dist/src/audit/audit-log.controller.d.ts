import { RequestContextService } from '../common/context/request-context.service';
import { AuditLogService } from './audit-log.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
export declare class AuditLogController {
    private readonly auditLogService;
    private readonly ctx;
    constructor(auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query: QueryAuditLogDto): unknown;
}
