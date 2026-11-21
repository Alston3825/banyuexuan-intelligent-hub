"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEmployeeProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateEmployeeProfileDto {
    accountId;
    employeeNo;
    hireDate;
    employmentType;
    healthCertExpiresAt;
    contractExpiresAt;
    probationEndsAt;
    remark;
    contractType;
    socialInsurance;
    idCardNo;
    bankAccountNo;
    bankName;
    emergencyContactName;
    emergencyContactPhone;
    emergencyContactRelation;
    address;
}
exports.CreateEmployeeProfileDto = CreateEmployeeProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "employeeNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "hireDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.EmploymentType, default: 'EMPLOYEE' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.EmploymentType),
    __metadata("design:type", typeof (_a = typeof client_1.EmploymentType !== "undefined" && client_1.EmploymentType) === "function" ? _a : Object)
], CreateEmployeeProfileDto.prototype, "employmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "healthCertExpiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "contractExpiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "probationEndsAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.EmployeeContractType, description: '合同类型' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.EmployeeContractType),
    __metadata("design:type", typeof (_b = typeof client_1.EmployeeContractType !== "undefined" && client_1.EmployeeContractType) === "function" ? _b : Object)
], CreateEmployeeProfileDto.prototype, "contractType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.SocialInsuranceStatus, description: '社保缴纳' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SocialInsuranceStatus),
    __metadata("design:type", typeof (_c = typeof client_1.SocialInsuranceStatus !== "undefined" && client_1.SocialInsuranceStatus) === "function" ? _c : Object)
], CreateEmployeeProfileDto.prototype, "socialInsurance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '身份证号（18 位，自动识别性别/出生日期）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(18),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "idCardNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '工资卡账号' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(32),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "bankAccountNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '开户行' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "emergencyContactName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "emergencyContactRelation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '现住址' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateEmployeeProfileDto.prototype, "address", void 0);
//# sourceMappingURL=create-employee-profile.dto.js.map