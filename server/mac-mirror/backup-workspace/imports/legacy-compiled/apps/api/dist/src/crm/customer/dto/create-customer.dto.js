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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCustomerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const customer_service_type_const_1 = require("./customer-service-type.const");
class CreateCustomerDto {
    name;
    phone;
    allowDuplicatePhone;
    channelTypeId;
    source;
    channelId;
    primaryStoreId;
    assignedToId;
    phoneSalesId;
    salutation;
    wechat;
    serviceTypes;
    hospital;
    expectedDueDate;
    region;
    address;
    zone;
    remark;
    idCardNo;
    birthday;
    allergens;
    dietTaboo;
    hisNo;
    passportNo;
    emergencyContactName;
    emergencyContactRelation;
    emergencyContactPhone;
    referrerType;
    referrerId;
    ccAccountIds;
    registeredAt;
}
exports.CreateCustomerDto = CreateCustomerDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.Matches)(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: '再次入住的妈妈（二胎等）允许手机号与已有客户重复；不传或 false 时手机号已被使用会被拒绝',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCustomerDto.prototype, "allowDuplicatePhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '渠道类型 id（客户渠道里维护的类型，可自定义）；和 source 二选一，页面用这个' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "channelTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.CustomerSource, description: '旧版 6 类渠道（线索转化、合同自动建客户等内部调用用）；传了会换算成对应的内置渠道类型' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CustomerSource),
    __metadata("design:type", typeof (_a = typeof client_1.CustomerSource !== "undefined" && client_1.CustomerSource) === "function" ? _a : Object)
], CreateCustomerDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '具体渠道（必须属于上面的渠道类型）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "channelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "primaryStoreId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '门店销售员（归属销售）；不传默认是录入人' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "assignedToId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '电话销售员' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "phoneSalesId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '宝妈称呼，如 小雨妈妈' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "salutation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "wechat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: customer_service_type_const_1.CUSTOMER_SERVICE_TYPES, isArray: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsIn)(customer_service_type_const_1.CUSTOMER_SERVICE_TYPES, { each: true }),
    __metadata("design:type", Array)
], CreateCustomerDto.prototype, "serviceTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "hospital", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "expectedDueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '片区（如 陆家嘴、世博小区）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "zone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '身份证号（测试阶段按普通信息处理，不打码）；填了会校验长度/出生日期/校验位' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "idCardNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '妈妈生日；不传且填了身份证时按身份证自动算' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "birthday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '过敏源' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "allergens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '饮食禁忌' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "dietTaboo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'HIS 登记号' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "hisNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '国际证件号（护照等）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "passportNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "emergencyContactName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "emergencyContactRelation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.ReferrerType, description: '推荐人类型：老客户 / 员工，和 referrerId 同时传' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ReferrerType),
    __metadata("design:type", typeof (_b = typeof client_1.ReferrerType !== "undefined" && client_1.ReferrerType) === "function" ? _b : Object)
], CreateCustomerDto.prototype, "referrerType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "referrerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '抄送人（员工账号 id 数组）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCustomerDto.prototype, "ccAccountIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '添加时间，不传默认当前时间（补录历史客户时可填过去的时间）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "registeredAt", void 0);
//# sourceMappingURL=create-customer.dto.js.map