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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLeadDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const lead_process_result_const_1 = require("./lead-process-result.const");
class UpdateLeadDto {
    name;
    phone;
    remark;
    customerId;
    appointmentType;
    appointmentTime;
    appointmentNote;
    processed;
    processResults;
    handleRemark;
    version;
}
exports.UpdateLeadDto = UpdateLeadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' }),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '关联客户：人工把这条预约/线索指向一个已有客户档案' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.LeadAppointmentType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.LeadAppointmentType),
    __metadata("design:type", typeof (_a = typeof client_1.LeadAppointmentType !== "undefined" && client_1.LeadAppointmentType) === "function" ? _a : Object)
], UpdateLeadDto.prototype, "appointmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '预约到店时间' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "appointmentTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '预约说明' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "appointmentNote", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '处理状态：未处理/已处理' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateLeadDto.prototype, "processed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: lead_process_result_const_1.LEAD_PROCESS_RESULTS, isArray: true, description: '处理结果，多选' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsIn)(lead_process_result_const_1.LEAD_PROCESS_RESULTS, { each: true }),
    __metadata("design:type", Array)
], UpdateLeadDto.prototype, "processResults", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '处理说明' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "handleRemark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '乐观锁版本号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateLeadDto.prototype, "version", void 0);
//# sourceMappingURL=update-lead.dto.js.map