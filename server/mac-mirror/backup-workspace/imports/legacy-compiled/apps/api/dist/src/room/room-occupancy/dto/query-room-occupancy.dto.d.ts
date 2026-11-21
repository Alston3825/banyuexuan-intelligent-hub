import { RoomOccupancyStatus } from '@prisma/client';
export declare class QueryRoomOccupancyDto {
    storeId?: string;
    roomId?: string;
    customerId?: string;
    status?: RoomOccupancyStatus;
    from?: string;
    to?: string;
}
