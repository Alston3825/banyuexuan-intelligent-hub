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
exports.CreateGoodsReceiptDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const goods_receipt_item_dto_1 = require("./goods-receipt-item.dto");
class CreateGoodsReceiptDto {
    storeId;
    warehouseId;
    purchaseOrderId;
    remark;
    items;
}
exports.CreateGoodsReceiptDto = CreateGoodsReceiptDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoodsReceiptDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoodsReceiptDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '关联的已审批采购单，可空——支持无采购单的临时入库' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoodsReceiptDto.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoodsReceiptDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [goods_receipt_item_dto_1.GoodsReceiptItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => goods_receipt_item_dto_1.GoodsReceiptItemDto),
    __metadata("design:type", Array)
], CreateGoodsReceiptDto.prototype, "items", void 0);
//# sourceMappingURL=create-goods-receipt.dto.js.map