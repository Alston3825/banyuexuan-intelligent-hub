import { CommonStatus, DeviceCategory } from '@prisma/client';
export declare class UpdateDeviceTypeDto {
    category?: DeviceCategory;
    name?: string;
    protocol?: string;
    requiresCommandConfirmation?: boolean;
    status?: CommonStatus;
    version: number;
}
