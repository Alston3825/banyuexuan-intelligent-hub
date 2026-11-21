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
exports.AssignRoleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const SCOPE_TYPES = ['TENANT', 'REGION', 'STORE', 'DEPARTMENT', 'TEAM', 'SELF'];
class AssignRoleDto {
    roleId;
    scopeType;
    scopeId;
    scopeIds;
}
exports.AssignRoleDto = AssignRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssignRoleDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SCOPE_TYPES }),
    (0, class_validator_1.IsIn)(SCOPE_TYPES),
    __metadata("design:type", Object)
], AssignRoleDto.prototype, "scopeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'TENANT/SELF 时可不传' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssignRoleDto.prototype, "scopeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '范围对象可多选（如同时管多家门店），每个对象生成一条分配' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AssignRoleDto.prototype, "scopeIds", void 0);
//# sourceMappingURL=assign-role.dto.js.map