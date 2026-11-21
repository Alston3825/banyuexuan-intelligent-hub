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
exports.StockCountController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const stock_count_service_1 = require("./stock-count.service");
const create_stock_count_dto_1 = require("./dto/create-stock-count.dto");
const query_stock_count_dto_1 = require("./dto/query-stock-count.dto");
const cancel_stock_count_dto_1 = require("./dto/cancel-stock-count.dto");
const version_dto_1 = require("./dto/version.dto");
let StockCountController = class StockCountController {
    stockCountService;
    constructor(stockCountService) {
        this.stockCountService = stockCountService;
    }
    findAll(query) {
        return this.stockCountService.findMany(query);
    }
    findOne(id) {
        return this.stockCountService.findOneOrThrow(id);
    }
    create(dto) {
        return this.stockCountService.create(dto);
    }
    submit(id, dto) {
        return this.stockCountService.submit(id, dto.version);
    }
    execute(id, dto) {
        return this.stockCountService.execute(id, dto.version);
    }
    cancel(id, dto) {
        return this.stockCountService.cancel(id, dto.cancelReason, dto.version);
    }
};
exports.StockCountController = StockCountController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-count.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_stock_count_dto_1.QueryStockCountDto]),
    __metadata("design:returntype", void 0)
], StockCountController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-count.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockCountController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-count.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_count_dto_1.CreateStockCountDto]),
    __metadata("design:returntype", void 0)
], StockCountController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-count.submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], StockCountController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/execute'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-count.execute'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], StockCountController.prototype, "execute", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-count.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_stock_count_dto_1.CancelStockCountDto]),
    __metadata("design:returntype", void 0)
], StockCountController.prototype, "cancel", null);
exports.StockCountController = StockCountController = __decorate([
    (0, swagger_1.ApiTags)('inventory/stock-count'),
    (0, common_1.Controller)('inventory/stock-counts'),
    __metadata("design:paramtypes", [stock_count_service_1.StockCountService])
], StockCountController);
//# sourceMappingURL=stock-count.controller.js.map