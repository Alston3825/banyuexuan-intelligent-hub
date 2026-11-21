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
exports.WarehouseStockController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const warehouse_stock_service_1 = require("./warehouse-stock.service");
const query_warehouse_stock_dto_1 = require("./dto/query-warehouse-stock.dto");
let WarehouseStockController = class WarehouseStockController {
    warehouseStockService;
    constructor(warehouseStockService) {
        this.warehouseStockService = warehouseStockService;
    }
    findAll(query) {
        return this.warehouseStockService.findMany(query);
    }
    overview(warehouseId, keyword, status) {
        const st = ['ALL', 'ALERT', 'LOW', 'OUT', 'IN_STOCK'].includes(status ?? '') ? status : 'ALL';
        return this.warehouseStockService.overview({ warehouseId: warehouseId || undefined, keyword, status: st });
    }
    lowStockAlerts(warehouseId) {
        return this.warehouseStockService.lowStockAlerts({ warehouseId });
    }
};
exports.WarehouseStockController = WarehouseStockController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.warehouse-stock.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_warehouse_stock_dto_1.QueryWarehouseStockDto]),
    __metadata("design:returntype", void 0)
], WarehouseStockController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('overview'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.warehouse-stock.view'),
    __param(0, (0, common_1.Query)('warehouseId')),
    __param(1, (0, common_1.Query)('keyword')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WarehouseStockController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('low-stock-alerts'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.warehouse-stock.view'),
    __param(0, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WarehouseStockController.prototype, "lowStockAlerts", null);
exports.WarehouseStockController = WarehouseStockController = __decorate([
    (0, swagger_1.ApiTags)('inventory/warehouse-stock'),
    (0, common_1.Controller)('inventory/warehouse-stocks'),
    __metadata("design:paramtypes", [warehouse_stock_service_1.WarehouseStockService])
], WarehouseStockController);
//# sourceMappingURL=warehouse-stock.controller.js.map