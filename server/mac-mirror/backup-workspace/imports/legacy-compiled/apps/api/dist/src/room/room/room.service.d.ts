import { Room } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { BaseScopedCrudService } from '../../common/base/base-scoped-crud.service';
import { QueryRoomDto } from './dto/query-room.dto';
import { QueryRoomBoardDto } from './dto/query-room-board.dto';
export type ComputedRoomStatus = 'MAINTENANCE' | 'OCCUPIED' | 'RESERVED' | 'PENDING_CLEANING' | 'VACANT';
export interface RoomBoardEntry {
    room: Room & {
        roomType: {
            id: string;
            name: string;
        };
    };
    status: ComputedRoomStatus;
    customerId: string | null;
    customerName: string | null;
    occupancyId: string | null;
    plannedCheckIn: Date | null;
    plannedCheckOut: Date | null;
    expectedDueDate: Date | null;
    signerName: string | null;
    actualCheckInAt: Date | null;
    contract: {
        id: string;
        paperNo: string | null;
        orientation: 'SOUTH' | 'NORTH' | 'BOTH' | null;
        careMode: 'ONE_TO_ONE' | 'ONE_TO_TWO' | null;
        inHouseDays: number | null;
        homeServiceDays: number;
    } | null;
    careBrief: {
        level: string | null;
        nurseName: string | null;
    } | null;
}
export interface RoomDeleteCheck {
    roomId: string;
    roomNo: string;
    occupancyTotal: number;
    activeOccupancyCount: number;
    deviceCount: number;
    blockers: string[];
    hasData: boolean;
    canForceDelete: boolean;
}
export declare class RoomService extends BaseScopedCrudService<Room> {
    private readonly prisma;
    protected readonly entityType = "Room";
    constructor(prisma: PrismaService, auditLogService: AuditLogService, ctx: RequestContextService);
    protected get delegate(): any;
    findMany(query?: QueryRoomDto): Promise<Room[]>;
    create(data: {
        storeId: string;
        roomTypeId: string;
        roomNo: string;
        floor: string;
    }): Promise<Room>;
    getDeleteCheck(id: string): Promise<RoomDeleteCheck>;
    remove(id: string, confirmRoomNo?: string): Promise<void>;
    setMaintenance(id: string, underMaintenance: boolean, note: string | undefined, expectedVersion: number): Promise<Room>;
    markCleaned(id: string, expectedVersion: number): Promise<Room>;
    getBoard(query: QueryRoomBoardDto): Promise<RoomBoardEntry[]>;
    private auditCtx;
}
