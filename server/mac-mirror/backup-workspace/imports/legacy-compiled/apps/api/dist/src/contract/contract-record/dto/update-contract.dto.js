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
exports.UpdateContractDto = exports.ContractItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ContractItemDto {
    name;
    quantity;
    needsReview;
}
exports.ContractItemDto = ContractItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContractItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], ContractItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'AI 没看清、需要销售核对' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ContractItemDto.prototype, "needsReview", void 0);
class UpdateContractDto {
    paperNo;
    signedDate;
    signerId;
    clientName;
    clientPhone;
    clientIdCardNo;
    clientHospital;
    clientAddress;
    emergencyName;
    emergencyRelation;
    emergencyPhone;
    fetus;
    dueDate;
    roomTypeText;
    roomTypeId;
    orientation;
    careMode;
    inHouseDays;
    homeServiceDays;
    daysText;
    estimatedCheckIn;
    estimatedCheckOut;
    amount;
    depositAmount;
    depositPaid;
    depositMethod;
    depositPaidAt;
    items;
    version;
}
exports.UpdateContractDto = UpdateContractDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '纸质合同封面编号' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "paperNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "signedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '签单人（销售账号 id）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "signerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "clientName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "clientPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "clientIdCardNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "clientHospital", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "clientAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "emergencyName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "emergencyRelation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "emergencyPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'single / twin / multi' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "fetus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '合同上的预产期' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "roomTypeText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "roomTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.ContractOrientation }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ContractOrientation),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "orientation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.CareMode }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CareMode),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "careMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '入住天数（N+N 的第一个 N）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "inHouseDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '出所后到家服务天数（第二个 N）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateContractDto.prototype, "homeServiceDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "daysText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '预估入住日期（销售按预产期推后几天估的，实际入住当天才确定）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "estimatedCheckIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '预估离店日期；不传则按 预估入住日期 + 入住天数 自动算' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "estimatedCheckOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '套餐金额（分）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateContractDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '订房定金（分）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "depositAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateContractDto.prototype, "depositPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.PaymentMethod }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "depositMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], UpdateContractDto.prototype, "depositPaidAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [ContractItemDto], description: '赠送/加购项目，传了就整体替换' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ContractItemDto),
    __metadata("design:type", Array)
], UpdateContractDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '乐观锁版本号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateContractDto.prototype, "version", void 0);
//# sourceMappingURL=update-contract.dto.js.map