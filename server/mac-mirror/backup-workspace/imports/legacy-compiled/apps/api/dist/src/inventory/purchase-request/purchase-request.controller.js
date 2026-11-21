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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseRequestController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const client_2 = require("@prisma/client");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const purchase_request_service_1 = require("./purchase-request.service");
const purchase_request_import_service_1 = require("./purchase-request-import.service");
class QueryDto {
    storeId;
    status;
    kind;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDto.prototype, "storeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PurchaseRequestStatus),
    __metadata("design:type", typeof (_a = typeof client_1.PurchaseRequestStatus !== "undefined" && client_1.PurchaseRequestStatus) === "function" ? _a : Object)
], QueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_2.PurchaseRequestKind),
    __metadata("design:type", typeof (_b = typeof client_2.PurchaseRequestKind !== "undefined" && client_2.PurchaseRequestKind) === "function" ? _b : Object)
], QueryDto.prototype, "kind", void 0);
class VersionDto {
    version;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], VersionDto.prototype, "version", void 0);
class CancelDto extends VersionDto {
    cancelReason;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CancelDto.prototype, "cancelReason", void 0);
class CommitImportDto {
    storeId;
    requestDate;
    sourceFileName;
    remark;
    rows;
    createMissingItems;
    allowDuplicate;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommitImportDto.prototype, "storeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommitImportDto.prototype, "requestDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommitImportDto.prototype, "sourceFileName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommitImportDto.prototype, "remark", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CommitImportDto.prototype, "rows", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CommitImportDto.prototype, "createMissingItems", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CommitImportDto.prototype, "allowDuplicate", void 0);
class LineDto extends VersionDto {
    name;
    spec;
    brand;
    unit;
    quantity;
    unitPrice;
    department;
    requester;
    purpose;
    remark;
    itemId;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LineDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], LineDto.prototype, "spec", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], LineDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], LineDto.prototype, "unit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LineDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], LineDto.prototype, "unitPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], LineDto.prototype, "department", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], LineDto.prototype, "requester", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], LineDto.prototype, "purpose", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], LineDto.prototype, "remark", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], LineDto.prototype, "itemId", void 0);
class ConvertDto extends VersionDto {
    supplierId;
    warehouseId;
    fixes;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConvertDto.prototype, "supplierId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConvertDto.prototype, "warehouseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ConvertDto.prototype, "fixes", void 0);
class CreateDepartmentDto {
    storeId;
    requestDate;
    remark;
    items;
    submit;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDepartmentDto.prototype, "storeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDepartmentDto.prototype, "requestDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDepartmentDto.prototype, "remark", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateDepartmentDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDepartmentDto.prototype, "submit", void 0);
class CreateManualDto {
    storeId;
    requestDate;
    remark;
    items;
    createMissingItems;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateManualDto.prototype, "storeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateManualDto.prototype, "requestDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateManualDto.prototype, "remark", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateManualDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateManualDto.prototype, "createMissingItems", void 0);
class CollectDto {
    ids;
    remark;
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CollectDto.prototype, "ids", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CollectDto.prototype, "remark", void 0);
let PurchaseRequestController = class PurchaseRequestController {
    service;
    importService;
    constructor(service, importService) {
        this.service = service;
        this.importService = importService;
    }
    findAll(query) {
        return this.service.findMany(query);
    }
    importPreview(file) {
        if (!file)
            throw new common_1.BadRequestException('请选择要上传的 Excel 文件');
        return this.importService.preview(file.buffer);
    }
    duplicate(storeId, requestDate) {
        return this.importService.checkDuplicate(storeId, requestDate);
    }
    importCommit(dto) {
        return this.importService.commit(dto);
    }
    createDepartment(dto) {
        return this.service.createDepartment(dto);
    }
    createManual(dto) {
        return this.service.createManual(dto);
    }
    collect(dto) {
        return this.service.collect(dto.ids, dto.remark);
    }
    findOne(id) {
        return this.service.detail(id);
    }
    addLine(id, dto) {
        const { version, ...body } = dto;
        return this.service.addLine(id, body, version);
    }
    updateLine(id, lineId, dto) {
        const { version, ...body } = dto;
        return this.service.updateLine(id, lineId, body, version);
    }
    removeLine(id, lineId, version) {
        return this.service.removeLine(id, lineId, Number(version));
    }
    submit(id, dto) {
        return this.service.submit(id, dto.version);
    }
    recall(id, dto) {
        return this.service.recall(id, dto.version);
    }
    cancel(id, dto) {
        return this.service.cancel(id, dto.cancelReason, dto.version);
    }
    convert(id, dto) {
        return this.service.convert(id, { supplierId: dto.supplierId, warehouseId: dto.warehouseId, fixes: dto.fixes }, dto.version);
    }
};
exports.PurchaseRequestController = PurchaseRequestController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryDto]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('import/preview'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.create'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof Express !== "undefined" && (_c = Express.Multer) !== void 0 && _c.File) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "importPreview", null);
__decorate([
    (0, common_1.Get)('import/duplicate'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.create'),
    __param(0, (0, common_1.Query)('storeId')),
    __param(1, (0, common_1.Query)('requestDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Post)('import/commit'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CommitImportDto]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "importCommit", null);
__decorate([
    (0, common_1.Post)('department'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateDepartmentDto]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "createDepartment", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateManualDto]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "createManual", null);
__decorate([
    (0, common_1.Post)('collect'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.collect'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CollectDto]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "collect", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, LineDto]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "addLine", null);
__decorate([
    (0, common_1.Patch)(':id/items/:lineId'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('lineId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, LineDto]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "updateLine", null);
__decorate([
    (0, common_1.Delete)(':id/items/:lineId'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('lineId')),
    __param(2, (0, common_1.Query)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "removeLine", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, VersionDto]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/recall'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, VersionDto]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "recall", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CancelDto]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/convert'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.purchase-request.convert'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ConvertDto]),
    __metadata("design:returntype", void 0)
], PurchaseRequestController.prototype, "convert", null);
exports.PurchaseRequestController = PurchaseRequestController = __decorate([
    (0, swagger_1.ApiTags)('inventory/purchase-request'),
    (0, common_1.Controller)('inventory/purchase-requests'),
    __metadata("design:paramtypes", [purchase_request_service_1.PurchaseRequestService,
        purchase_request_import_service_1.PurchaseRequestImportService])
], PurchaseRequestController);
//# sourceMappingURL=purchase-request.controller.js.map