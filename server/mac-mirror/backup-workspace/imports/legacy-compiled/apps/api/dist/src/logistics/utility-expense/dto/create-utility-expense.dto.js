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
exports.CreateUtilityExpenseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateUtilityExpenseDto {
    storeId;
    period;
    expenseType;
    amount;
    remark;
}
exports.CreateUtilityExpenseDto = CreateUtilityExpenseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUtilityExpenseDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '格式 YYYY-MM' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}$/, { message: 'period 格式应为 YYYY-MM' }),
    __metadata("design:type", String)
], CreateUtilityExpenseDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.UtilityExpenseType }),
    (0, class_validator_1.IsEnum)(client_1.UtilityExpenseType),
    __metadata("design:type", typeof (_a = typeof client_1.UtilityExpenseType !== "undefined" && client_1.UtilityExpenseType) === "function" ? _a : Object)
], CreateUtilityExpenseDto.prototype, "expenseType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '金额，最小货币单位（分）' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateUtilityExpenseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUtilityExpenseDto.prototype, "remark", void 0);
//# sourceMappingURL=create-utility-expense.dto.js.map