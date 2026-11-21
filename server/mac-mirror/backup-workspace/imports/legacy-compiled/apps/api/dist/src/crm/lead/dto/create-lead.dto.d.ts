import { CustomerSource, LeadAppointmentType } from '@prisma/client';
export declare class CreateLeadDto {
    name: string;
    phone: string;
    source: CustomerSource;
    storeId?: string;
    remark?: string;
    customerId?: string;
    appointmentType?: LeadAppointmentType;
    appointmentTime?: string;
    appointmentNote?: string;
}
