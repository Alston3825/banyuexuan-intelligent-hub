import { CareMode, ContractOrientation, PaymentMethod } from '@prisma/client';
export declare class ContractItemDto {
    name: string;
    quantity?: string | null;
    needsReview?: boolean;
}
export declare class UpdateContractDto {
    paperNo?: string | null;
    signedDate?: string | null;
    signerId?: string | null;
    clientName?: string | null;
    clientPhone?: string | null;
    clientIdCardNo?: string | null;
    clientHospital?: string | null;
    clientAddress?: string | null;
    emergencyName?: string | null;
    emergencyRelation?: string | null;
    emergencyPhone?: string | null;
    fetus?: string | null;
    dueDate?: string | null;
    roomTypeText?: string | null;
    roomTypeId?: string | null;
    orientation?: ContractOrientation | null;
    careMode?: CareMode | null;
    inHouseDays?: number | null;
    homeServiceDays?: number;
    daysText?: string | null;
    estimatedCheckIn?: string | null;
    estimatedCheckOut?: string | null;
    amount?: number;
    depositAmount?: number | null;
    depositPaid?: boolean;
    depositMethod?: PaymentMethod | null;
    depositPaidAt?: string | null;
    items?: ContractItemDto[];
    version: number;
}
