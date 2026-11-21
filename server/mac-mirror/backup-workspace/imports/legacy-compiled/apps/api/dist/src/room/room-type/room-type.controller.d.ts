import { RoomTypeService } from './room-type.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
export declare class RoomTypeController {
    private readonly roomTypeService;
    constructor(roomTypeService: RoomTypeService);
    findAll(): Promise<{}>;
    findOne(id: string): Promise<T>;
    create(dto: CreateRoomTypeDto): Promise<RoomType>;
    update(id: string, dto: UpdateRoomTypeDto): Promise<T>;
}
