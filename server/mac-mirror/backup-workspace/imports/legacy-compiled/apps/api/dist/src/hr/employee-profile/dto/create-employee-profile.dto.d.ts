import { EmployeeContractType, EmploymentType, SocialInsuranceStatus } from '@prisma/client';
export declare class CreateEmployeeProfileDto {
    accountId: string;
    employeeNo: string;
    hireDate: string;
    employmentType?: EmploymentType;
    healthCertExpiresAt?: string;
    contractExpiresAt?: string;
    probationEndsAt?: string;
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
}
