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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePayrollRecordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePayrollRecordDto {
    storeId;
    employeeProfileId;
    period;
    baseSalary;
    deductions;
    remark;
}
exports.CreatePayrollRecordDto = CreatePayrollRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePayrollRecordDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePayrollRecordDto.prototype, "employeeProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '格式 YYYY-MM' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}$/, { message: 'period 格式应为 YYYY-MM' }),
    __metadata("design:type", String)
], CreatePayrollRecordDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '底薪，最小货币单位' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePayrollRecordDto.prototype, "baseSalary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '扣款，最小货币单位' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePayrollRecordDto.prototype, "deductions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePayrollRecordDto.prototype, "remark", void 0);
//# sourceMappingURL=create-payroll-record.dto.js.map