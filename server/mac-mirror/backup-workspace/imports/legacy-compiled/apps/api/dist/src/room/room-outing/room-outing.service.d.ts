import { RoomOuting } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateRoomOutingDto } from './dto/create-room-outing.dto';
import { QueryRoomOutingDto } from './dto/query-room-outing.dto';
export declare class RoomOutingService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryRoomOutingDto): Promise<RoomOuting[]>;
    findOneOrThrow(id: string): Promise<RoomOuting>;
    create(dto: CreateRoomOutingDto): Promise<RoomOuting>;
    checkOut(id: string, expectedVersion: number): Promise<RoomOuting>;
    checkBack(id: string, expectedVersion: number): Promise<RoomOuting>;
    cancel(id: string, cancelReason: string, expectedVersion: number): Promise<RoomOuting>;
    private assertVersion;
    private transition;
    private auditCtx;
}
