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
exports.RoleController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const role_service_1 = require("./role.service");
const create_role_dto_1 = require("./dto/create-role.dto");
const update_role_dto_1 = require("./dto/update-role.dto");
const grant_permission_dto_1 = require("./dto/grant-permission.dto");
class ChangePermissionsDto {
    grant;
    revoke;
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ChangePermissionsDto.prototype, "grant", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ChangePermissionsDto.prototype, "revoke", void 0);
let RoleController = class RoleController {
    roleService;
    constructor(roleService) {
        this.roleService = roleService;
    }
    findAll() {
        return this.roleService.findMany();
    }
    findOne(id) {
        return this.roleService.findOneOrThrow(id);
    }
    create(dto) {
        return this.roleService.create(dto);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.roleService.update(id, data, version);
    }
    remove(id) {
        return this.roleService.delete(id);
    }
    changePermissions(id, dto) {
        return this.roleService.changePermissions(id, dto.grant, dto.revoke);
    }
    defaultsPreview(id) {
        return this.roleService.defaultsPreview(id);
    }
    restoreDefaults(id) {
        return this.roleService.restoreDefaults(id);
    }
    grantPermission(id, dto) {
        return this.roleService.grantPermission(id, dto.permissionPointId);
    }
    revokePermission(id, permissionPointId) {
        return this.roleService.revokePermission(id, permissionPointId);
    }
};
exports.RoleController = RoleController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('platform.role.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('platform.role.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('platform.role.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_role_dto_1.CreateRoleDto]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('platform.role.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_role_dto_1.UpdateRoleDto]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('platform.role.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/permissions'),
    (0, require_permission_decorator_1.RequirePermission)('platform.role.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ChangePermissionsDto]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "changePermissions", null);
__decorate([
    (0, common_1.Get)(':id/default-permissions'),
    (0, require_permission_decorator_1.RequirePermission)('platform.role.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "defaultsPreview", null);
__decorate([
    (0, common_1.Post)(':id/restore-defaults'),
    (0, require_permission_decorator_1.RequirePermission)('platform.role.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "restoreDefaults", null);
__decorate([
    (0, common_1.Post)(':id/permissions'),
    (0, require_permission_decorator_1.RequirePermission)('platform.role.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, grant_permission_dto_1.GrantPermissionDto]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "grantPermission", null);
__decorate([
    (0, common_1.Delete)(':id/permissions/:permissionPointId'),
    (0, require_permission_decorator_1.RequirePermission)('platform.role.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('permissionPointId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "revokePermission", null);
exports.RoleController = RoleController = __decorate([
    (0, swagger_1.ApiTags)('platform/role'),
    (0, common_1.Controller)('platform/roles'),
    __metadata("design:paramtypes", [role_service_1.RoleService])
], RoleController);
//# sourceMappingURL=role.controller.js.map