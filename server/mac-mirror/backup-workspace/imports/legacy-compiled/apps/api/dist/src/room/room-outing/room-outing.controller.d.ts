import { RoomOutingService } from './room-outing.service';
import { CreateRoomOutingDto } from './dto/create-room-outing.dto';
import { QueryRoomOutingDto } from './dto/query-room-outing.dto';
import { VersionDto } from './dto/version.dto';
import { CancelRoomOutingDto } from './dto/cancel-room-outing.dto';
export declare class RoomOutingController {
    private readonly roomOutingService;
    constructor(roomOutingService: RoomOutingService);
    findAll(query: QueryRoomOutingDto): Promise<{}>;
    create(dto: CreateRoomOutingDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    checkOut(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    checkBack(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    cancel(id: string, dto: CancelRoomOutingDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
