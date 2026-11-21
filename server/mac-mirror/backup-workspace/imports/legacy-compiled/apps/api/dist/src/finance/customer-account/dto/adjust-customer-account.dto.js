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
exports.AdjustCustomerAccountDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AdjustCustomerAccountDto {
    customerId;
    principalDelta;
    giftDelta;
    remark;
}
exports.AdjustCustomerAccountDto = AdjustCustomerAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustCustomerAccountDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '本金调整量，可正可负，最小货币单位（分）' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AdjustCustomerAccountDto.prototype, "principalDelta", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '赠送余额调整量，可正可负，最小货币单位（分）' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AdjustCustomerAccountDto.prototype, "giftDelta", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '调整原因' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AdjustCustomerAccountDto.prototype, "remark", void 0);
//# sourceMappingURL=adjust-customer-account.dto.js.map