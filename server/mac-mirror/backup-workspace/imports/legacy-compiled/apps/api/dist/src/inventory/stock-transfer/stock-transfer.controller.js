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
exports.StockTransferController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const stock_transfer_service_1 = require("./stock-transfer.service");
const create_stock_transfer_dto_1 = require("./dto/create-stock-transfer.dto");
const query_stock_transfer_dto_1 = require("./dto/query-stock-transfer.dto");
const cancel_stock_transfer_dto_1 = require("./dto/cancel-stock-transfer.dto");
const version_dto_1 = require("./dto/version.dto");
let StockTransferController = class StockTransferController {
    stockTransferService;
    constructor(stockTransferService) {
        this.stockTransferService = stockTransferService;
    }
    findAll(query) {
        return this.stockTransferService.findMany(query);
    }
    findOne(id) {
        return this.stockTransferService.findOneOrThrow(id);
    }
    create(dto) {
        return this.stockTransferService.create(dto);
    }
    submit(id, dto) {
        return this.stockTransferService.submit(id, dto.version);
    }
    execute(id, dto) {
        return this.stockTransferService.execute(id, dto.version);
    }
    cancel(id, dto) {
        return this.stockTransferService.cancel(id, dto.cancelReason, dto.version);
    }
};
exports.StockTransferController = StockTransferController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-transfer.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_stock_transfer_dto_1.QueryStockTransferDto]),
    __metadata("design:returntype", void 0)
], StockTransferController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-transfer.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockTransferController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-transfer.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_transfer_dto_1.CreateStockTransferDto]),
    __metadata("design:returntype", void 0)
], StockTransferController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-transfer.submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], StockTransferController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/execute'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-transfer.execute'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], StockTransferController.prototype, "execute", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-transfer.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_stock_transfer_dto_1.CancelStockTransferDto]),
    __metadata("design:returntype", void 0)
], StockTransferController.prototype, "cancel", null);
exports.StockTransferController = StockTransferController = __decorate([
    (0, swagger_1.ApiTags)('inventory/stock-transfer'),
    (0, common_1.Controller)('inventory/stock-transfers'),
    __metadata("design:paramtypes", [stock_transfer_service_1.StockTransferService])
], StockTransferController);
//# sourceMappingURL=stock-transfer.controller.js.map