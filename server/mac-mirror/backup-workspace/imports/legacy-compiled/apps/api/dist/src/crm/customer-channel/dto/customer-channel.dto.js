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
exports.QueryCustomerChannelDto = exports.UpdateCustomerChannelDto = exports.CreateCustomerChannelDto = exports.UpdateChannelTypeDto = exports.CreateChannelTypeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateChannelTypeDto {
    name;
}
exports.CreateChannelTypeDto = CreateChannelTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '渠道类型名称，如 医院合作、美团点评' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], CreateChannelTypeDto.prototype, "name", void 0);
class UpdateChannelTypeDto {
    name;
    status;
    sortOrder;
    version;
}
exports.UpdateChannelTypeDto = UpdateChannelTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], UpdateChannelTypeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.CommonStatus, description: '停用后新建客户时不再可选，已有客户不受影响' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CommonStatus),
    __metadata("design:type", typeof (_a = typeof client_1.CommonStatus !== "undefined" && client_1.CommonStatus) === "function" ? _a : Object)
], UpdateChannelTypeDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '排序，小的在前' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateChannelTypeDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '乐观锁版本号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateChannelTypeDto.prototype, "version", void 0);
class CreateCustomerChannelDto {
    typeId;
    name;
}
exports.CreateCustomerChannelDto = CreateCustomerChannelDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '所属渠道类型 id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCustomerChannelDto.prototype, "typeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '具体渠道名称，如 小红书、某某医院合作' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateCustomerChannelDto.prototype, "name", void 0);
class UpdateCustomerChannelDto {
    name;
    status;
    version;
}
exports.UpdateCustomerChannelDto = UpdateCustomerChannelDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateCustomerChannelDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.CommonStatus, description: '停用后新建客户时不再可选，已有客户不受影响' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CommonStatus),
    __metadata("design:type", typeof (_b = typeof client_1.CommonStatus !== "undefined" && client_1.CommonStatus) === "function" ? _b : Object)
], UpdateCustomerChannelDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '乐观锁版本号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateCustomerChannelDto.prototype, "version", void 0);
class QueryCustomerChannelDto {
    typeId;
    status;
}
exports.QueryCustomerChannelDto = QueryCustomerChannelDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCustomerChannelDto.prototype, "typeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.CommonStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CommonStatus),
    __metadata("design:type", typeof (_c = typeof client_1.CommonStatus !== "undefined" && client_1.CommonStatus) === "function" ? _c : Object)
], QueryCustomerChannelDto.prototype, "status", void 0);
//# sourceMappingURL=customer-channel.dto.js.map