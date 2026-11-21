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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStockIssueDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const stock_issue_item_dto_1 = require("./stock-issue-item.dto");
class CreateStockIssueDto {
    storeId;
    warehouseId;
    issueType;
    remark;
    items;
}
exports.CreateStockIssueDto = CreateStockIssueDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockIssueDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockIssueDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.StockIssueType, default: 'ISSUE' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.StockIssueType),
    __metadata("design:type", typeof (_a = typeof client_1.StockIssueType !== "undefined" && client_1.StockIssueType) === "function" ? _a : Object)
], CreateStockIssueDto.prototype, "issueType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '领用类型时登记领用部门/用途' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockIssueDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [stock_issue_item_dto_1.StockIssueItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => stock_issue_item_dto_1.StockIssueItemDto),
    __metadata("design:type", Array)
], CreateStockIssueDto.prototype, "items", void 0);
//# sourceMappingURL=create-stock-issue.dto.js.map