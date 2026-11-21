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
exports.StockBatchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const stock_batch_service_1 = require("./stock-batch.service");
const query_stock_batch_dto_1 = require("./dto/query-stock-batch.dto");
let StockBatchController = class StockBatchController {
    stockBatchService;
    constructor(stockBatchService) {
        this.stockBatchService = stockBatchService;
    }
    findAll(query) {
        return this.stockBatchService.findMany(query);
    }
    expiryAlerts(warehouseId, withinDays) {
        return this.stockBatchService.expiryAlerts({ warehouseId, withinDays: withinDays ? Number(withinDays) : undefined });
    }
};
exports.StockBatchController = StockBatchController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-batch.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_stock_batch_dto_1.QueryStockBatchDto]),
    __metadata("design:returntype", void 0)
], StockBatchController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('expiry-alerts'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-batch.view'),
    __param(0, (0, common_1.Query)('warehouseId')),
    __param(1, (0, common_1.Query)('withinDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StockBatchController.prototype, "expiryAlerts", null);
exports.StockBatchController = StockBatchController = __decorate([
    (0, swagger_1.ApiTags)('inventory/stock-batch'),
    (0, common_1.Controller)('inventory/stock-batches'),
    __metadata("design:paramtypes", [stock_batch_service_1.StockBatchService])
], StockBatchController);
//# sourceMappingURL=stock-batch.controller.js.map