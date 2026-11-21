import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { QueryRoomBoardDto } from './dto/query-room-board.dto';
import { MaintenanceRoomDto } from './dto/maintenance-room.dto';
import { CleanRoomDto } from './dto/clean-room.dto';
export declare class RoomController {
    private readonly roomService;
    constructor(roomService: RoomService);
    getBoard(query: QueryRoomBoardDto): Promise<{}>;
    findAll(query: QueryRoomDto): Promise<{}>;
    deleteCheck(id: string): Promise<import("./room.service").RoomDeleteCheck>;
    findOne(id: string): Promise<T>;
    create(dto: CreateRoomDto): Promise<Room>;
    update(id: string, dto: UpdateRoomDto): Promise<T>;
    setMaintenance(id: string, dto: MaintenanceRoomDto): Promise<Room>;
    markCleaned(id: string, dto: CleanRoomDto): Promise<Room>;
    remove(id: string, confirmRoomNo?: string): unknown;
}
