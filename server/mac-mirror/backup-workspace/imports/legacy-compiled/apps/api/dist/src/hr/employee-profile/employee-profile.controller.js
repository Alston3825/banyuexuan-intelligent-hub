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
exports.EmployeeProfileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const employee_profile_service_1 = require("./employee-profile.service");
const create_employee_profile_dto_1 = require("./dto/create-employee-profile.dto");
const update_employee_profile_dto_1 = require("./dto/update-employee-profile.dto");
const query_employee_profile_dto_1 = require("./dto/query-employee-profile.dto");
class ArchiveEmployeeDto {
    terminationDate;
    reason;
    version;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ArchiveEmployeeDto.prototype, "terminationDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(191),
    __metadata("design:type", String)
], ArchiveEmployeeDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ArchiveEmployeeDto.prototype, "version", void 0);
class RestoreEmployeeDto {
    employeeNo;
    version;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], RestoreEmployeeDto.prototype, "employeeNo", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], RestoreEmployeeDto.prototype, "version", void 0);
let EmployeeProfileController = class EmployeeProfileController {
    employeeProfileService;
    constructor(employeeProfileService) {
        this.employeeProfileService = employeeProfileService;
    }
    findAll(query) {
        return this.employeeProfileService.findMany(query);
    }
    nextNo(storeId) {
        return this.employeeProfileService.nextNo(storeId || undefined);
    }
    expiryAlerts(withinDays) {
        return this.employeeProfileService.expiryAlerts(withinDays ? Number(withinDays) : undefined);
    }
    findOne(id) {
        return this.employeeProfileService.findOneOrThrow(id);
    }
    create(dto) {
        return this.employeeProfileService.create(dto);
    }
    archive(id, dto) {
        return this.employeeProfileService.archive(id, dto);
    }
    restore(id, dto) {
        return this.employeeProfileService.restore(id, dto);
    }
    update(id, dto) {
        return this.employeeProfileService.update(id, dto);
    }
};
exports.EmployeeProfileController = EmployeeProfileController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('hr.employee-profile.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_employee_profile_dto_1.QueryEmployeeProfileDto]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-no'),
    (0, require_permission_decorator_1.RequirePermission)('hr.employee-profile.view'),
    __param(0, (0, common_1.Query)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "nextNo", null);
__decorate([
    (0, common_1.Get)('expiry-alerts'),
    (0, require_permission_decorator_1.RequirePermission)('hr.employee-profile.view'),
    __param(0, (0, common_1.Query)('withinDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "expiryAlerts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('hr.employee-profile.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('hr.employee-profile.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_employee_profile_dto_1.CreateEmployeeProfileDto]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, require_permission_decorator_1.RequirePermission)('hr.employee-profile.archive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ArchiveEmployeeDto]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, require_permission_decorator_1.RequirePermission)('hr.employee-profile.restore'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RestoreEmployeeDto]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "restore", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('hr.employee-profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_employee_profile_dto_1.UpdateEmployeeProfileDto]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "update", null);
exports.EmployeeProfileController = EmployeeProfileController = __decorate([
    (0, swagger_1.ApiTags)('hr/employee-profile'),
    (0, common_1.Controller)('hr/employee-profiles'),
    __metadata("design:paramtypes", [employee_profile_service_1.EmployeeProfileService])
], EmployeeProfileController);
//# sourceMappingURL=employee-profile.controller.js.map