import { DeviceStatus } from '@prisma/client';
export declare class UpdateDeviceDto {
    name?: string;
    roomId?: string;
    status?: DeviceStatus;
    version: number;
}
