import { CommonStatus } from '@prisma/client';
export declare class CreateChannelTypeDto {
    name: string;
}
export declare class UpdateChannelTypeDto {
    name?: string;
    status?: CommonStatus;
    sortOrder?: number;
    version: number;
}
export declare class CreateCustomerChannelDto {
    typeId: string;
    name: string;
}
export declare class UpdateCustomerChannelDto {
    name?: string;
    status?: CommonStatus;
    version: number;
}
export declare class QueryCustomerChannelDto {
    typeId?: string;
    status?: CommonStatus;
}
