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
exports.QueryCustomerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class QueryCustomerDto {
    assignedToId;
    primaryStoreId;
    keyword;
    archived;
}
exports.QueryCustomerDto = QueryCustomerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCustomerDto.prototype, "assignedToId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCustomerDto.prototype, "primaryStoreId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '按姓名/手机号模糊匹配' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCustomerDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '归档：不传=只看未归档；only=只看已归档；all=全部' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['only', 'all']),
    __metadata("design:type", String)
], QueryCustomerDto.prototype, "archived", void 0);
//# sourceMappingURL=query-customer.dto.js.map