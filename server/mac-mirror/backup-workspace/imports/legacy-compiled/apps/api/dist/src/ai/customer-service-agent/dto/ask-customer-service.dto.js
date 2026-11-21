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
exports.AskCustomerServiceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AskCustomerServiceDto {
    businessType;
    businessId;
    storeId;
    question;
}
exports.AskCustomerServiceDto = AskCustomerServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['LEAD', 'CUSTOMER'] }),
    (0, class_validator_1.IsIn)(['LEAD', 'CUSTOMER']),
    __metadata("design:type", String)
], AskCustomerServiceDto.prototype, "businessType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AskCustomerServiceDto.prototype, "businessId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AskCustomerServiceDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '员工向AI提出的问题' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AskCustomerServiceDto.prototype, "question", void 0);
//# sourceMappingURL=ask-customer-service.dto.js.map