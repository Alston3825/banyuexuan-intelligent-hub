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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmployeeProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class UpdateEmployeeProfileDto {
    employeeNo;
    hireDate;
    employmentType;
    healthCertExpiresAt;
    contractExpiresAt;
    probationEndsAt;
    terminationDate;
    terminationReason;
    status;
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
    watchId;
    dutyStatus;
    responsibleFloors;
    version;
}
exports.UpdateEmployeeProfileDto = UpdateEmployeeProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "employeeNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "hireDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.EmploymentType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.EmploymentType),
    __metadata("design:type", typeof (_a = typeof client_1.EmploymentType !== "undefined" && client_1.EmploymentType) === "function" ? _a : Object)
], UpdateEmployeeProfileDto.prototype, "employmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "healthCertExpiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "contractExpiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "probationEndsAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "terminationDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "terminationReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.EmployeeProfileStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.EmployeeProfileStatus),
    __metadata("design:type", typeof (_b = typeof client_1.EmployeeProfileStatus !== "undefined" && client_1.EmployeeProfileStatus) === "function" ? _b : Object)
], UpdateEmployeeProfileDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.EmployeeContractType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.EmployeeContractType),
    __metadata("design:type", typeof (_c = typeof client_1.EmployeeContractType !== "undefined" && client_1.EmployeeContractType) === "function" ? _c : Object)
], UpdateEmployeeProfileDto.prototype, "contractType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.SocialInsuranceStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SocialInsuranceStatus),
    __metadata("design:type", typeof (_d = typeof client_1.SocialInsuranceStatus !== "undefined" && client_1.SocialInsuranceStatus) === "function" ? _d : Object)
], UpdateEmployeeProfileDto.prototype, "socialInsurance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(18),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "idCardNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(32),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "bankAccountNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "emergencyContactName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "emergencyContactRelation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '呼叫系统手表设备号，空串=清空' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "watchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.DutyStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.DutyStatus),
    __metadata("design:type", typeof (_e = typeof client_1.DutyStatus !== "undefined" && client_1.DutyStatus) === "function" ? _e : Object)
], UpdateEmployeeProfileDto.prototype, "dutyStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '负责楼层，如 [\"2F\",\"3F\"]' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateEmployeeProfileDto.prototype, "responsibleFloors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '乐观锁版本号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateEmployeeProfileDto.prototype, "version", void 0);
//# sourceMappingURL=update-employee-profile.dto.js.map