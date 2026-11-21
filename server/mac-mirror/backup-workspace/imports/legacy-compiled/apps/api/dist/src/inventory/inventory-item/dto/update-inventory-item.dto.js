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
exports.UpdateInventoryItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateInventoryItemDto {
    name;
    category;
    unit;
    spec;
    brand;
    referencePrice;
    safetyStockThreshold;
    shelfLifeDays;
    status;
    version;
}
exports.UpdateInventoryItemDto = UpdateInventoryItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateInventoryItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateInventoryItemDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '计量单位（只改显示的名称，库存数量不换算）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], UpdateInventoryItemDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '空字符串 = 清空' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateInventoryItemDto.prototype, "spec", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '空字符串 = 清空' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateInventoryItemDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, nullable: true, description: '传 null = 清空' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], UpdateInventoryItemDto.prototype, "referencePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateInventoryItemDto.prototype, "safetyStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateInventoryItemDto.prototype, "shelfLifeDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['ACTIVE', 'INACTIVE'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ACTIVE', 'INACTIVE']),
    __metadata("design:type", String)
], UpdateInventoryItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '乐观锁版本号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateInventoryItemDto.prototype, "version", void 0);
//# sourceMappingURL=update-inventory-item.dto.js.map