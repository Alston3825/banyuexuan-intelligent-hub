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
exports.QueryAuditLogDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AUDIT_ACTIONS = [
    'LOGIN',
    'LOGIN_FAILED',
    'LOGOUT',
    'CREATE',
    'UPDATE',
    'DELETE',
    'VOID',
    'STATE_TRANSITION',
    'APPROVE',
    'REJECT',
    'WITHDRAW',
    'REASSIGN',
    'ADD_APPROVER',
    'CC',
    'ARCHIVE',
    'SENSITIVE_QUERY',
    'EXPORT',
    'PRINT',
];
class QueryAuditLogDto {
    entityType;
    entityId;
    accountId;
    action;
    page;
    pageSize;
}
exports.QueryAuditLogDto = QueryAuditLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAuditLogDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAuditLogDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAuditLogDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: AUDIT_ACTIONS }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(AUDIT_ACTIONS),
    __metadata("design:type", Object)
], QueryAuditLogDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], QueryAuditLogDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], QueryAuditLogDto.prototype, "pageSize", void 0);
//# sourceMappingURL=query-audit-log.dto.js.map