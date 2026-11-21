import { ServiceAppointmentStatus } from '@prisma/client';
export declare class QueryServiceAppointmentDto {
    customerId?: string;
    therapistId?: string;
    storeId?: string;
    status?: ServiceAppointmentStatus;
}
