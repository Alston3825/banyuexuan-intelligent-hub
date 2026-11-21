import { RoomRequisitionStatus } from '@prisma/client';
export declare class QueryRoomServiceRequisitionDto {
    occupancyId?: string;
    storeId?: string;
    status?: RoomRequisitionStatus;
}
