import { RoomCallStatus } from '@prisma/client';
export declare class QueryRoomCallDto {
    occupancyId?: string;
    storeId?: string;
    status?: RoomCallStatus;
}
