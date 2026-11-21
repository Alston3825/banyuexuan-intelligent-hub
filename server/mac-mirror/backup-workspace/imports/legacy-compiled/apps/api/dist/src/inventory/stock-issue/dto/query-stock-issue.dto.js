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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryStockIssueDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class QueryStockIssueDto {
    storeId;
    warehouseId;
    issueType;
    status;
}
exports.QueryStockIssueDto = QueryStockIssueDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryStockIssueDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryStockIssueDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.StockIssueType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.StockIssueType),
    __metadata("design:type", typeof (_a = typeof client_1.StockIssueType !== "undefined" && client_1.StockIssueType) === "function" ? _a : Object)
], QueryStockIssueDto.prototype, "issueType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.InventoryDocStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.InventoryDocStatus),
    __metadata("design:type", typeof (_b = typeof client_1.InventoryDocStatus !== "undefined" && client_1.InventoryDocStatus) === "function" ? _b : Object)
], QueryStockIssueDto.prototype, "status", void 0);
//# sourceMappingURL=query-stock-issue.dto.js.map