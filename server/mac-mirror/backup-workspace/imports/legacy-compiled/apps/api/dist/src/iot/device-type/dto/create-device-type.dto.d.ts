import { DeviceCategory } from '@prisma/client';
export declare class CreateDeviceTypeDto {
    category: DeviceCategory;
    name: string;
    protocol: string;
    requiresCommandConfirmation?: boolean;
}
