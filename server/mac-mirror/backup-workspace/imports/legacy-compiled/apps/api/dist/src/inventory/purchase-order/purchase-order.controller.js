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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const purchase_order_service_1 = require("./purchase-order.service");
const purchase_order_logistics_service_1 = require("./purchase-order-logistics.service");
const purchase_order_1688_import_service_1 = require("./purchase-order-1688-import.service");
const create_purchase_order_dto_1 = require("./dto/create-purchase-order.dto");
const query_purchase_order_dto_1 = require("./dto/query-purchase-order.dto");
const cancel_purchase_order_dto_1 = require("./dto/cancel-purchase-order.dto");
const version_dto_1 = require("./dto/version.dto");
class LogisticsDto {
    platform;
    platformOrderNo;
    expressNo;
    expressCompany;
    expressPhoneTail;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], LogisticsDto.prototype, "platform", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], LogisticsDto.prototype, "platformOrderNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], LogisticsDto.prototype, "expressNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], LogisticsDto.prototype, "expressCompany", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(8),
    __metadata("design:type", String)
], LogisticsDto.prototype, "expressPhoneTail", void 0);
class Commit1688Dto {
    items;
}
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], Commit1688Dto.prototype, "items", void 0);
class ConfirmPurchaseDto {
    version;
    expressNo;
    note;
}
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ConfirmPurchaseDto.prototype, "version", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], ConfirmPurchaseDto.prototype, "expressNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], ConfirmPurchaseDto.prototype, "note", void 0);
let PurchaseOrderController = class PurchaseOrderController {
    purchaseOrderService;
    logistics;
    import1688;
    constructor(purchaseOrderService, logistics, import1688) {
        this.purchaseOrderService = purchaseOrderService;
        this.logistics = logistics;
        this.import1688 = import1688;
    }
    logisticsMeta() {
        return this.logistics.meta();
    }
    import1688Preview(file) {
        if (!file)
            throw new common_1.BadRequestException('请选择 1688 导出的订单 Excel 文件');
        return this.import1688.preview(file.buffer);
    }
    import1688Commit(dto) {
        return this.import1688.commit(dto.items);
    }
    findAll(query) {
        return this.purchaseOrderService.findMany(query);
    }
    shipments(id) {
        return this.logistics.shipments(id);
    }
    refreshShipments(id) {
        return this.logistics.refreshShipments(id);
    }
    refreshShipment(id, sid) {
        return this.logistics.refreshShipment(id, sid);
    }
    getLogistics(id) {
        return this.logistics.get(id);
    }
    updateLogistics(id, dto) {
        return this.logistics.updateInfo(id, dto);
    }
    refreshLogistics(id) {
        return this.logistics.refresh(id);
    }
    findOne(id) {
        return this.purchaseOrderService.findOneOrThrow(id);
    }
    create(dto) {
        return this.purchaseOrderService.create(dto);
    }
    submit(id, dto) {
        return this.purchaseOrderService.submit(id, dto.version);
    }
    confirmPurchase(id, dto) {
        return this.purchaseOrderService.confirmPurchase(id, { expressNo: dto.expressNo, note: dto.note }, dto.version);
    }
    cancel(id, dto) {
        return this.purchaseOrderService.cancel(id, dto.cancelReason, dto.version);
    }
};
exports.PurchaseOrderController = PurchaseOrderController;
__decorate([
    (0, common_1.Get)('logistics-meta'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "logisticsMeta", null);
__decorate([
    (0, common_1.Post)('import-1688/preview'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.purchase'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof Express !== "undefined" && (_a = Express.Multer) !== void 0 && _a.File) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "import1688Preview", null);
__decorate([
    (0, common_1.Post)('import-1688/commit'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.purchase'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Commit1688Dto]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "import1688Commit", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_purchase_order_dto_1.QueryPurchaseOrderDto]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/shipments'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "shipments", null);
__decorate([
    (0, common_1.Post)(':id/shipments/refresh'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "refreshShipments", null);
__decorate([
    (0, common_1.Post)(':id/shipments/:sid/refresh'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.view'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('sid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "refreshShipment", null);
__decorate([
    (0, common_1.Get)(':id/logistics'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "getLogistics", null);
__decorate([
    (0, common_1.Patch)(':id/logistics'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.purchase'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, LogisticsDto]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "updateLogistics", null);
__decorate([
    (0, common_1.Post)(':id/logistics/refresh'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "refreshLogistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_purchase_order_dto_1.CreatePurchaseOrderDto]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/confirm-purchase'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.purchase'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ConfirmPurchaseDto]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "confirmPurchase", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-order.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_purchase_order_dto_1.CancelPurchaseOrderDto]),
    __metadata("design:returntype", void 0)
], PurchaseOrderController.prototype, "cancel", null);
exports.PurchaseOrderController = PurchaseOrderController = __decorate([
    (0, swagger_1.ApiTags)('inventory/purchase-order'),
    (0, common_1.Controller)('inventory/purchase-orders'),
    __metadata("design:paramtypes", [purchase_order_service_1.PurchaseOrderService,
        purchase_order_logistics_service_1.PurchaseOrderLogisticsService,
        purchase_order_1688_import_service_1.PurchaseOrder1688ImportService])
], PurchaseOrderController);
//# sourceMappingURL=purchase-order.controller.js.map