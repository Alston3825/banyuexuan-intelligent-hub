import { VehicleStatus } from '@prisma/client';
export declare class UpdateVehicleDto {
    model?: string;
    remark?: string;
    status?: VehicleStatus;
    version: number;
}
