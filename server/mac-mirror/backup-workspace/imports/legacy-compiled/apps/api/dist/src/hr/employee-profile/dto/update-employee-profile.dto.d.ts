import { DutyStatus, EmployeeContractType, EmployeeProfileStatus, EmploymentType, SocialInsuranceStatus } from '@prisma/client';
export declare class UpdateEmployeeProfileDto {
    employeeNo?: string;
    hireDate?: string;
    employmentType?: EmploymentType;
    healthCertExpiresAt?: string;
    contractExpiresAt?: string;
    probationEndsAt?: string;
    terminationDate?: string;
    terminationReason?: string;
    status?: EmployeeProfileStatus;
    remark?: string;
    contractType?: EmployeeContractType;
    socialInsurance?: SocialInsuranceStatus;
    idCardNo?: string;
    bankAccountNo?: string;
    bankName?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    address?: string;
    watchId?: string;
    dutyStatus?: DutyStatus;
    responsibleFloors?: string[];
    version: number;
}
