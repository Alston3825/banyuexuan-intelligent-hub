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
exports.GoodsReceiptItemDto = exports.NewReceiptItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class NewReceiptItemDto {
    name;
    spec;
    brand;
    unit;
}
exports.NewReceiptItemDto = NewReceiptItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], NewReceiptItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewReceiptItemDto.prototype, "spec", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewReceiptItemDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '计量单位，如 个/箱/桶' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], NewReceiptItemDto.prototype, "unit", void 0);
class GoodsReceiptItemDto {
    itemId;
    newItem;
    renameItemTo;
    quantity;
    unitCost;
}
exports.GoodsReceiptItemDto = GoodsReceiptItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '物品库里已有的物品；新物品不传，改传 newItem' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoodsReceiptItemDto.prototype, "itemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: NewReceiptItemDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NewReceiptItemDto),
    __metadata("design:type", NewReceiptItemDto)
], GoodsReceiptItemDto.prototype, "newItem", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '用已有物品，同时把它的名称改成这个（人工确认“用新名称”时）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoodsReceiptItemDto.prototype, "renameItemTo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GoodsReceiptItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '入库单位成本，最小货币单位' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GoodsReceiptItemDto.prototype, "unitCost", void 0);
//# sourceMappingURL=goods-receipt-item.dto.js.map