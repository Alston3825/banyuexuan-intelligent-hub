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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodsReceiptController = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const goods_receipt_service_1 = require("./goods-receipt.service");
const create_goods_receipt_dto_1 = require("./dto/create-goods-receipt.dto");
const query_goods_receipt_dto_1 = require("./dto/query-goods-receipt.dto");
const cancel_goods_receipt_dto_1 = require("./dto/cancel-goods-receipt.dto");
const version_dto_1 = require("./dto/version.dto");
class ReceiveLineDto {
    receiptItemId;
    quantity;
    expiresAt;
    note;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReceiveLineDto.prototype, "receiptItemId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ReceiveLineDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveLineDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], ReceiveLineDto.prototype, "note", void 0);
class ReceiveDto {
    lines;
    expressNo;
    note;
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReceiveLineDto),
    __metadata("design:type", Array)
], ReceiveDto.prototype, "lines", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], ReceiveDto.prototype, "expressNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], ReceiveDto.prototype, "note", void 0);
class CloseShortDto {
    reason;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CloseShortDto.prototype, "reason", void 0);
let GoodsReceiptController = class GoodsReceiptController {
    goodsReceiptService;
    constructor(goodsReceiptService) {
        this.goodsReceiptService = goodsReceiptService;
    }
    findAll(query) {
        return this.goodsReceiptService.findMany(query);
    }
    findOne(id) {
        return this.goodsReceiptService.findOneOrThrow(id);
    }
    create(dto) {
        return this.goodsReceiptService.create(dto);
    }
    submit(id, dto) {
        return this.goodsReceiptService.submit(id, dto.version);
    }
    execute(id, dto) {
        return this.goodsReceiptService.execute(id, dto.version);
    }
    receive(id, dto) {
        return this.goodsReceiptService.receive(id, dto);
    }
    closeShort(id, dto) {
        return this.goodsReceiptService.closeShort(id, dto.reason);
    }
    cancel(id, dto) {
        return this.goodsReceiptService.cancel(id, dto.cancelReason, dto.version);
    }
};
exports.GoodsReceiptController = GoodsReceiptController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.goods-receipt.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_goods_receipt_dto_1.QueryGoodsReceiptDto]),
    __metadata("design:returntype", void 0)
], GoodsReceiptController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.goods-receipt.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GoodsReceiptController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.goods-receipt.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_goods_receipt_dto_1.CreateGoodsReceiptDto]),
    __metadata("design:returntype", void 0)
], GoodsReceiptController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.goods-receipt.submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], GoodsReceiptController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/execute'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.goods-receipt.execute'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], GoodsReceiptController.prototype, "execute", null);
__decorate([
    (0, common_1.Post)(':id/receive'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.goods-receipt.receive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ReceiveDto]),
    __metadata("design:returntype", void 0)
], GoodsReceiptController.prototype, "receive", null);
__decorate([
    (0, common_1.Post)(':id/close-short'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.goods-receipt.receive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CloseShortDto]),
    __metadata("design:returntype", void 0)
], GoodsReceiptController.prototype, "closeShort", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.goods-receipt.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_goods_receipt_dto_1.CancelGoodsReceiptDto]),
    __metadata("design:returntype", void 0)
], GoodsReceiptController.prototype, "cancel", null);
exports.GoodsReceiptController = GoodsReceiptController = __decorate([
    (0, swagger_1.ApiTags)('inventory/goods-receipt'),
    (0, common_1.Controller)('inventory/goods-receipts'),
    __metadata("design:paramtypes", [goods_receipt_service_1.GoodsReceiptService])
], GoodsReceiptController);
//# sourceMappingURL=goods-receipt.controller.js.map