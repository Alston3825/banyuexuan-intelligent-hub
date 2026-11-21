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
exports.CreateCommissionRecordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const commission_allocation_input_dto_1 = require("./commission-allocation-input.dto");
class CreateCommissionRecordDto {
    storeId;
    type;
    sourceType;
    sourceId;
    totalAmount;
    remark;
    allocations;
}
exports.CreateCommissionRecordDto = CreateCommissionRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommissionRecordDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.CommissionType }),
    (0, class_validator_1.IsEnum)(client_1.CommissionType),
    __metadata("design:type", typeof (_a = typeof client_1.CommissionType !== "undefined" && client_1.CommissionType) === "function" ? _a : Object)
], CreateCommissionRecordDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '触发单据类型，如 PAYMENT / SERVICE_APPOINTMENT / CUSTOMER_SERVICE_PACKAGE' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommissionRecordDto.prototype, "sourceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommissionRecordDto.prototype, "sourceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '本次提成总金额，最小货币单位' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCommissionRecordDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommissionRecordDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [commission_allocation_input_dto_1.CommissionAllocationInputDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => commission_allocation_input_dto_1.CommissionAllocationInputDto),
    __metadata("design:type", Array)
], CreateCommissionRecordDto.prototype, "allocations", void 0);
//# sourceMappingURL=create-commission-record.dto.js.map