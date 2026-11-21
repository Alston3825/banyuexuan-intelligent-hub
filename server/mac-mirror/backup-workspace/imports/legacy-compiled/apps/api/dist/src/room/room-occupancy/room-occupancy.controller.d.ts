import { RoomOccupancyService } from './room-occupancy.service';
import { CreateRoomOccupancyDto } from './dto/create-room-occupancy.dto';
import { QueryRoomOccupancyDto } from './dto/query-room-occupancy.dto';
import { CheckInRoomOccupancyDto } from './dto/check-in-room-occupancy.dto';
import { CheckOutRoomOccupancyDto } from './dto/check-out-room-occupancy.dto';
import { CancelRoomOccupancyDto } from './dto/cancel-room-occupancy.dto';
import { RescheduleRoomOccupancyDto } from './dto/reschedule-room-occupancy.dto';
declare class ChangeRoomDto {
    roomId: string;
    version: number;
}
export declare class RoomOccupancyController {
    private readonly roomOccupancyService;
    constructor(roomOccupancyService: RoomOccupancyService);
    findAll(query: QueryRoomOccupancyDto): Promise<{}>;
    conflicts(storeId?: string): Promise<{}>;
    freeRooms(id: string): unknown;
    checkInRooms(id: string, from?: string, to?: string): unknown;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateRoomOccupancyDto): Promise<any>;
    checkIn(id: string, dto: CheckInRoomOccupancyDto): Promise<any>;
    checkOut(id: string, dto: CheckOutRoomOccupancyDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    cancel(id: string, dto: CancelRoomOccupancyDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    changeRoom(id: string, dto: ChangeRoomDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    reschedule(id: string, dto: RescheduleRoomOccupancyDto): Promise<any>;
}
export {};
