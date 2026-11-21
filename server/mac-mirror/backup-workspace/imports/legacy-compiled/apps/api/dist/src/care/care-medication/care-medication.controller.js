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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareMedicationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_medication_service_1 = require("./care-medication.service");
class MedicationBody {
    motherProfileId;
    babyProfileId;
    previousAuthId;
    changeNote;
    documentId;
    version;
    header;
    items;
}
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationBody.prototype, "motherProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationBody.prototype, "babyProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '变更：基于哪一份委托书新签' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationBody.prototype, "previousAuthId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationBody.prototype, "changeNote", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], MedicationBody.prototype, "documentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '修改时的乐观锁版本号' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], MedicationBody.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], MedicationBody.prototype, "header", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], MedicationBody.prototype, "items", void 0);
class StopBody {
    version;
    note;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StopBody.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StopBody.prototype, "note", void 0);
let CareMedicationController = class CareMedicationController {
    service;
    constructor(service) {
        this.service = service;
    }
    specs() {
        return this.service.specs();
    }
    list(motherProfileId, babyProfileId) {
        return this.service.list({ motherProfileId, babyProfileId });
    }
    create(dto) {
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    stop(id, dto) {
        return this.service.stop(id, dto);
    }
};
exports.CareMedicationController = CareMedicationController;
__decorate([
    (0, common_1.Get)('specs'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CareMedicationController.prototype, "specs", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)('motherProfileId')),
    __param(1, (0, common_1.Query)('babyProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CareMedicationController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MedicationBody]),
    __metadata("design:returntype", void 0)
], CareMedicationController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, MedicationBody]),
    __metadata("design:returntype", void 0)
], CareMedicationController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/stop'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, StopBody]),
    __metadata("design:returntype", void 0)
], CareMedicationController.prototype, "stop", null);
exports.CareMedicationController = CareMedicationController = __decorate([
    (0, swagger_1.ApiTags)('care/medication'),
    (0, common_1.Controller)('care/medications'),
    __metadata("design:paramtypes", [care_medication_service_1.CareMedicationService])
], CareMedicationController);
//# sourceMappingURL=care-medication.controller.js.map