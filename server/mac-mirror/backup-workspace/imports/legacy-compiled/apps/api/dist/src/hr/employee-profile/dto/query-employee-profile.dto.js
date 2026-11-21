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
exports.QueryEmployeeProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class QueryEmployeeProfileDto {
    storeId;
    status;
    departmentId;
    archived;
    keyword;
}
exports.QueryEmployeeProfileDto = QueryEmployeeProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryEmployeeProfileDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.EmployeeProfileStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.EmployeeProfileStatus),
    __metadata("design:type", typeof (_a = typeof client_1.EmployeeProfileStatus !== "undefined" && client_1.EmployeeProfileStatus) === "function" ? _a : Object)
], QueryEmployeeProfileDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '部门' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryEmployeeProfileDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['only', 'all'], description: '默认不含已离职归档的；only=只看已归档；all=全部' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['only', 'all']),
    __metadata("design:type", String)
], QueryEmployeeProfileDto.prototype, "archived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '按姓名/工号搜索' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryEmployeeProfileDto.prototype, "keyword", void 0);
//# sourceMappingURL=query-employee-profile.dto.js.map