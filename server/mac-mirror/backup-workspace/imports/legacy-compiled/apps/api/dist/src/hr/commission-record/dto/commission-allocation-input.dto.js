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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionAllocationInputDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CommissionAllocationInputDto {
    employeeProfileId;
    roleLabel;
    basisPoints;
}
exports.CommissionAllocationInputDto = CommissionAllocationInputDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommissionAllocationInputDto.prototype, "employeeProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '如"销售"/"主管"/"店长"/"第一服务人"' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommissionAllocationInputDto.prototype, "roleLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '万分比，0-10000 代表 0.00%-100.00%' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", Number)
], CommissionAllocationInputDto.prototype, "basisPoints", void 0);
//# sourceMappingURL=commission-allocation-input.dto.js.map