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
exports.StockIssueController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const stock_issue_service_1 = require("./stock-issue.service");
const create_stock_issue_dto_1 = require("./dto/create-stock-issue.dto");
const query_stock_issue_dto_1 = require("./dto/query-stock-issue.dto");
const cancel_stock_issue_dto_1 = require("./dto/cancel-stock-issue.dto");
const version_dto_1 = require("./dto/version.dto");
let StockIssueController = class StockIssueController {
    stockIssueService;
    constructor(stockIssueService) {
        this.stockIssueService = stockIssueService;
    }
    findAll(query) {
        return this.stockIssueService.findMany(query);
    }
    findOne(id) {
        return this.stockIssueService.findOneOrThrow(id);
    }
    create(dto) {
        return this.stockIssueService.create(dto);
    }
    submit(id, dto) {
        return this.stockIssueService.submit(id, dto.version);
    }
    execute(id, dto) {
        return this.stockIssueService.execute(id, dto.version);
    }
    cancel(id, dto) {
        return this.stockIssueService.cancel(id, dto.cancelReason, dto.version);
    }
};
exports.StockIssueController = StockIssueController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-issue.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_stock_issue_dto_1.QueryStockIssueDto]),
    __metadata("design:returntype", void 0)
], StockIssueController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-issue.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockIssueController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-issue.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_issue_dto_1.CreateStockIssueDto]),
    __metadata("design:returntype", void 0)
], StockIssueController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-issue.submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], StockIssueController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/execute'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-issue.execute'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], StockIssueController.prototype, "execute", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.stock-issue.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_stock_issue_dto_1.CancelStockIssueDto]),
    __metadata("design:returntype", void 0)
], StockIssueController.prototype, "cancel", null);
exports.StockIssueController = StockIssueController = __decorate([
    (0, swagger_1.ApiTags)('inventory/stock-issue'),
    (0, common_1.Controller)('inventory/stock-issues'),
    __metadata("design:paramtypes", [stock_issue_service_1.StockIssueService])
], StockIssueController);
//# sourceMappingURL=stock-issue.controller.js.map