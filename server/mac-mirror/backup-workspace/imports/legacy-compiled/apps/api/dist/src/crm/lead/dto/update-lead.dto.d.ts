import { LeadAppointmentType } from '@prisma/client';
export declare class UpdateLeadDto {
    name?: string;
    phone?: string;
    remark?: string;
    customerId?: string;
    appointmentType?: LeadAppointmentType;
    appointmentTime?: string;
    appointmentNote?: string;
    processed?: boolean;
    processResults?: string[];
    handleRemark?: string;
    version: number;
}
