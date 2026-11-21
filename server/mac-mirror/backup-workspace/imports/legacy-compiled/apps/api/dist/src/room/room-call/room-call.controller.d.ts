import { RoomCallService } from './room-call.service';
import { CreateRoomCallDto } from './dto/create-room-call.dto';
import { QueryRoomCallDto } from './dto/query-room-call.dto';
export declare class RoomCallController {
    private readonly roomCallService;
    constructor(roomCallService: RoomCallService);
    findAll(query: QueryRoomCallDto): Promise<{}>;
    create(dto: CreateRoomCallDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    handle(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
