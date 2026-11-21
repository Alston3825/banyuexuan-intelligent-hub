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
exports.CarePlanVersionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_plan_version_service_1 = require("./care-plan-version.service");
class PlanDto {
    motherProfileId;
    babyProfileId;
    level;
    source;
    assessmentSummary;
    focusPoints;
    measures;
    progressNote;
    adjustReason;
    directActivate;
    version;
}
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlanDto.prototype, "motherProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PlanDto.prototype, "babyProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlanDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlanDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PlanDto.prototype, "assessmentSummary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PlanDto.prototype, "focusPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], PlanDto.prototype, "measures", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PlanDto.prototype, "progressNote", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PlanDto.prototype, "adjustReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PlanDto.prototype, "directActivate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PlanDto.prototype, "version", void 0);
class VersionDto {
    version;
    comment;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], VersionDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VersionDto.prototype, "comment", void 0);
class RejectDto {
    version;
    comment;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], RejectDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RejectDto.prototype, "comment", void 0);
class ServiceLogDto {
    motherProfileId;
    babyProfileId;
    serviceCode;
    doneDate;
    doneTime;
    systolic;
    diastolic;
    heartRate;
    weightKg;
    doneByName;
    clientSigned;
    note;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ServiceLogDto.prototype, "motherProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], ServiceLogDto.prototype, "babyProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ServiceLogDto.prototype, "serviceCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceLogDto.prototype, "doneDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceLogDto.prototype, "doneTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ServiceLogDto.prototype, "systolic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ServiceLogDto.prototype, "diastolic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '心率 次/分（测血压时一起登记，选填）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ServiceLogDto.prototype, "heartRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ServiceLogDto.prototype, "weightKg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceLogDto.prototype, "doneByName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ServiceLogDto.prototype, "clientSigned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceLogDto.prototype, "note", void 0);
class ToggleDayDto {
    motherProfileId;
    babyProfileId;
    serviceCode;
    date;
    done;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ToggleDayDto.prototype, "motherProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], ToggleDayDto.prototype, "babyProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ToggleDayDto.prototype, "serviceCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ToggleDayDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ToggleDayDto.prototype, "done", void 0);
class ImportPreviewDto {
    documentId;
    babyProfileId;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ImportPreviewDto.prototype, "documentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], ImportPreviewDto.prototype, "babyProfileId", void 0);
class ImportCommitDto extends ImportPreviewDto {
    items;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ImportCommitDto.prototype, "items", void 0);
void class_validator_1.IsObject;
let CarePlanVersionController = class CarePlanVersionController {
    service;
    logs;
    constructor(service, logs) {
        this.service = service;
        this.logs = logs;
    }
    standards() {
        return this.service.standards();
    }
    due(storeId) {
        return this.service.due(storeId);
    }
    list(motherProfileId) {
        return this.service.list(motherProfileId);
    }
    create(dto) {
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    submit(id, dto) {
        return this.service.submit(id, dto.version);
    }
    approve(id, dto) {
        return this.service.approve(id, dto.version, dto.comment);
    }
    reject(id, dto) {
        return this.service.reject(id, dto.version, dto.comment);
    }
    summary(motherProfileId) {
        return this.logs.summary(motherProfileId);
    }
    createLog(dto) {
        return this.logs.create(dto);
    }
    importPreview(dto) {
        return this.logs.importPreview(dto.documentId, dto.babyProfileId);
    }
    importCommit(dto) {
        return this.logs.importCommit(dto);
    }
    toggleDay(dto) {
        return this.logs.toggleDay({ ...dto, done: !!dto.done });
    }
    removeLog(id) {
        return this.logs.remove(id);
    }
};
exports.CarePlanVersionController = CarePlanVersionController;
__decorate([
    (0, common_1.Get)('plan-versions/standards'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "standards", null);
__decorate([
    (0, common_1.Get)('plan-versions/due'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "due", null);
__decorate([
    (0, common_1.Get)('plan-versions'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)('motherProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('plan-versions'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PlanDto]),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('plan-versions/:id'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, PlanDto]),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('plan-versions/:id/submit'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, VersionDto]),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)('plan-versions/:id/approve'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, VersionDto]),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('plan-versions/:id/reject'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RejectDto]),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)('service-logs/summary'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)('motherProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "summary", null);
__decorate([
    (0, common_1.Post)('service-logs'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ServiceLogDto]),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "createLog", null);
__decorate([
    (0, common_1.Post)('service-logs/import-preview'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ImportPreviewDto]),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "importPreview", null);
__decorate([
    (0, common_1.Post)('service-logs/import-commit'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ImportCommitDto]),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "importCommit", null);
__decorate([
    (0, common_1.Post)('service-logs/toggle-day'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ToggleDayDto]),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "toggleDay", null);
__decorate([
    (0, common_1.Delete)('service-logs/:id'),
    (0, common_1.HttpCode)(204),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarePlanVersionController.prototype, "removeLog", null);
exports.CarePlanVersionController = CarePlanVersionController = __decorate([
    (0, swagger_1.ApiTags)('care/plan-version'),
    (0, common_1.Controller)('care'),
    __metadata("design:paramtypes", [care_plan_version_service_1.CarePlanVersionService,
        care_plan_version_service_1.CareServiceLogService])
], CarePlanVersionController);
//# sourceMappingURL=care-plan-version.controller.js.map