import { RoomServiceRequisitionService } from './room-service-requisition.service';
import { CreateRoomServiceRequisitionDto } from './dto/create-room-service-requisition.dto';
import { QueryRoomServiceRequisitionDto } from './dto/query-room-service-requisition.dto';
export declare class RoomServiceRequisitionController {
    private readonly roomServiceRequisitionService;
    constructor(roomServiceRequisitionService: RoomServiceRequisitionService);
    findAll(query: QueryRoomServiceRequisitionDto): Promise<{}>;
    create(dto: CreateRoomServiceRequisitionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    fulfill(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
