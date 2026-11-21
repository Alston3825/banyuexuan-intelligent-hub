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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const mask_entity_decorator_1 = require("../../common/decorators/mask-entity.decorator");
const audit_sensitive_query_decorator_1 = require("../../common/decorators/audit-sensitive-query.decorator");
const account_service_1 = require("./account.service");
const account_import_service_1 = require("./account-import.service");
const create_account_dto_1 = require("./dto/create-account.dto");
const update_account_dto_1 = require("./dto/update-account.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const assign_role_dto_1 = require("./dto/assign-role.dto");
class CommitImportDto {
    rows;
    storeId;
    createMissing;
    roleId;
    importProfileDetails;
}
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CommitImportDto.prototype, "rows", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommitImportDto.prototype, "storeId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CommitImportDto.prototype, "createMissing", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommitImportDto.prototype, "roleId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CommitImportDto.prototype, "importProfileDetails", void 0);
let AccountController = class AccountController {
    accountService;
    importService;
    constructor(accountService, importService) {
        this.accountService = accountService;
        this.importService = importService;
    }
    importPreview(file) {
        if (!file)
            throw new common_1.BadRequestException('请选择要上传的 Excel 文件');
        return this.importService.preview(file.buffer);
    }
    importCommit(dto) {
        return this.importService.commit(dto);
    }
    findAll() {
        return this.accountService.findMany();
    }
    findOne(id) {
        return this.accountService.findOneOrThrow(id);
    }
    create(dto) {
        return this.accountService.create(dto);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.accountService.update(id, data, version);
    }
    resetPassword(id, dto) {
        return this.accountService.resetPassword(id, dto.newPassword);
    }
    assignRole(id, dto) {
        return this.accountService.assignRole(id, dto.roleId, dto.scopeType, dto.scopeIds?.length ? dto.scopeIds : dto.scopeId ? [dto.scopeId] : []);
    }
    revokeRoleAssignment(id, assignmentId) {
        return this.accountService.revokeRoleAssignment(id, assignmentId);
    }
    remove(id) {
        return this.accountService.remove(id);
    }
};
exports.AccountController = AccountController;
__decorate([
    (0, common_1.Post)('import/preview'),
    (0, require_permission_decorator_1.RequirePermission)('platform.account.create'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof Express !== "undefined" && (_a = Express.Multer) !== void 0 && _a.File) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "importPreview", null);
__decorate([
    (0, common_1.Post)('import/commit'),
    (0, require_permission_decorator_1.RequirePermission)('platform.account.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CommitImportDto]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "importCommit", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('platform.account.view'),
    (0, audit_sensitive_query_decorator_1.AuditSensitiveQuery)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('platform.account.view'),
    (0, audit_sensitive_query_decorator_1.AuditSensitiveQuery)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('platform.account.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_account_dto_1.CreateAccountDto]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('platform.account.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_account_dto_1.UpdateAccountDto]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/password'),
    (0, require_permission_decorator_1.RequirePermission)('platform.account.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)(':id/role-assignments'),
    (0, require_permission_decorator_1.RequirePermission)('platform.account.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_role_dto_1.AssignRoleDto]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Delete)(':id/role-assignments/:assignmentId'),
    (0, require_permission_decorator_1.RequirePermission)('platform.account.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('assignmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "revokeRoleAssignment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('platform.account.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "remove", null);
exports.AccountController = AccountController = __decorate([
    (0, swagger_1.ApiTags)('platform/account'),
    (0, common_1.Controller)('platform/accounts'),
    (0, mask_entity_decorator_1.MaskEntity)('Account'),
    __metadata("design:paramtypes", [account_service_1.AccountService,
        account_import_service_1.AccountImportService])
], AccountController);
//# sourceMappingURL=account.controller.js.map