import { RoomServiceRequisition } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { CreateRoomServiceRequisitionDto } from './dto/create-room-service-requisition.dto';
import { QueryRoomServiceRequisitionDto } from './dto/query-room-service-requisition.dto';
export declare class RoomServiceRequisitionService {
    private readonly prisma;
    private readonly auditLogService;
    private readonly ctx;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    findMany(query?: QueryRoomServiceRequisitionDto): Promise<RoomServiceRequisition[]>;
    findOneOrThrow(id: string): Promise<RoomServiceRequisition>;
    create(dto: CreateRoomServiceRequisitionDto): Promise<RoomServiceRequisition>;
    fulfill(id: string): Promise<RoomServiceRequisition>;
    private auditCtx;
}
