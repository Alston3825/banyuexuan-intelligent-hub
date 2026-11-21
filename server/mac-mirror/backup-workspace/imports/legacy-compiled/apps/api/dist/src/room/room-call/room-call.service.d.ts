import { RoomCall } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateRoomCallDto } from './dto/create-room-call.dto';
import { QueryRoomCallDto } from './dto/query-room-call.dto';
export declare class RoomCallService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryRoomCallDto): Promise<RoomCall[]>;
    findOneOrThrow(id: string): Promise<RoomCall>;
    create(dto: CreateRoomCallDto): Promise<RoomCall>;
    handle(id: string): Promise<RoomCall>;
    private auditCtx;
}
