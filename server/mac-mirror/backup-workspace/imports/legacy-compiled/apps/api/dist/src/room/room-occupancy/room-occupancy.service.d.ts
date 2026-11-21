import { RoomOccupancy } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { IntegrationEventsService } from '../../integration/integration-events.service';
import { CustomerService } from '../../crm/customer/customer.service';
import { CheckInRoomOccupancyDto } from './dto/check-in-room-occupancy.dto';
import { CreateRoomOccupancyDto } from './dto/create-room-occupancy.dto';
import { ConflictBrief, RoomConflict } from './room-conflicts.util';
import { QueryRoomOccupancyDto } from './dto/query-room-occupancy.dto';
import { RescheduleRoomOccupancyDto } from './dto/reschedule-room-occupancy.dto';
export declare class RoomOccupancyService {
    private readonly prisma;
    private readonly customerService;
    private readonly auditLogService;
    private readonly ctx;
    private readonly integrationEvents;
    constructor(prisma: PrismaService, customerService: CustomerService, auditLogService: AuditLogService, ctx: RequestContextService, integrationEvents: IntegrationEventsService);
    findMany(query: QueryRoomOccupancyDto): Promise<RoomOccupancy[]>;
    findOneOrThrow(id: string): Promise<RoomOccupancy>;
    private bufferDays;
    private softConflicts;
    findConflicts(storeId?: string): Promise<RoomConflict[]>;
    freeRooms(id: string): unknown;
    private emitStay;
    changeRoom(id: string, roomId: string, expectedVersion: number): Promise<RoomOccupancy>;
    private linkMotherProfile;
    create(dto: CreateRoomOccupancyDto): Promise<RoomOccupancy & {
        conflicts: ConflictBrief[];
    }>;
    checkInRooms(id: string, from?: string, to?: string): unknown;
    checkIn(id: string, dto: CheckInRoomOccupancyDto): Promise<RoomOccupancy & {
        conflicts: ConflictBrief[];
    }>;
    checkOut(id: string, expectedVersion: number): Promise<RoomOccupancy>;
    cancel(id: string, cancelReason: string, expectedVersion: number): Promise<RoomOccupancy>;
    reschedule(id: string, dto: RescheduleRoomOccupancyDto): Promise<RoomOccupancy & {
        conflicts: ConflictBrief[];
    }>;
    private assertVersion;
    private auditCtx;
}
