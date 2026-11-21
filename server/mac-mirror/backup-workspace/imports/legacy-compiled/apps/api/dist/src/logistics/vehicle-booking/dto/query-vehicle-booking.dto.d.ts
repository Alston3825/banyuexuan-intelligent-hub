import { VehicleBookingStatus } from '@prisma/client';
export declare class QueryVehicleBookingDto {
    vehicleId?: string;
    storeId?: string;
    status?: VehicleBookingStatus;
}
