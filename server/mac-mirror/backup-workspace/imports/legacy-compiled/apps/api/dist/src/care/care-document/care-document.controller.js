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
exports.CareDocumentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_document_service_1 = require("./care-document.service");
const MAX_FILE_BYTES = 30 * 1024 * 1024;
const MAX_FILES = 20;
class UploadCareDocumentDto {
    docType;
    motherProfileId;
    babyProfileId;
    title;
    docDate;
    remark;
    scope;
    autoExtract;
}
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.CareDocType }),
    (0, class_validator_1.IsEnum)(client_1.CareDocType),
    __metadata("design:type", typeof (_a = typeof client_1.CareDocType !== "undefined" && client_1.CareDocType) === "function" ? _a : Object)
], UploadCareDocumentDto.prototype, "docType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadCareDocumentDto.prototype, "motherProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '宝宝类资料（新生儿入所/宝宝出所评估等）要指定哪个宝宝' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadCareDocumentDto.prototype, "babyProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadCareDocumentDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UploadCareDocumentDto.prototype, "docDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadCareDocumentDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: "识别范围：BABY_FEEDING=只认宝宝单页（体征+24小时喂养记录单）" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['BABY_FEEDING']),
    __metadata("design:type", String)
], UploadCareDocumentDto.prototype, "scope", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: "传 'false' 表示只留档、不自动识别（手工录入后补传原件时用）" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadCareDocumentDto.prototype, "autoExtract", void 0);
class QueryCareDocumentDto {
    motherProfileId;
    babyProfileId;
    docType;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCareDocumentDto.prototype, "motherProfileId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCareDocumentDto.prototype, "babyProfileId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CareDocType),
    __metadata("design:type", typeof (_b = typeof client_1.CareDocType !== "undefined" && client_1.CareDocType) === "function" ? _b : Object)
], QueryCareDocumentDto.prototype, "docType", void 0);
class UpdateCareDocumentDto {
    title;
    docDate;
    remark;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateCareDocumentDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], UpdateCareDocumentDto.prototype, "docDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateCareDocumentDto.prototype, "remark", void 0);
let CareDocumentController = class CareDocumentController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(query) {
        return this.service.list(query);
    }
    upload(files, dto) {
        return this.service.upload(files, dto);
    }
    findOne(id) {
        return this.service.getOne(id);
    }
    async file(id, fileId, res) {
        const { stream, size, mimeType, fileName } = await this.service.openFile(id, fileId);
        res.set({
            'Content-Type': mimeType,
            'Content-Length': String(size),
            'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
            'Cache-Control': 'private, max-age=3600',
        });
        return new common_1.StreamableFile(stream);
    }
    addFiles(id, files) {
        return this.service.addFiles(id, files);
    }
    update(id, dto) {
        return this.service.updateMeta(id, dto);
    }
    extract(id) {
        return this.service.reextract(id);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.CareDocumentController = CareDocumentController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryCareDocumentDto]),
    __metadata("design:returntype", void 0)
], CareDocumentController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.create'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', MAX_FILES, { limits: { fileSize: MAX_FILE_BYTES } })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, UploadCareDocumentDto]),
    __metadata("design:returntype", void 0)
], CareDocumentController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareDocumentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/files/:fileId'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CareDocumentController.prototype, "file", null);
__decorate([
    (0, common_1.Post)(':id/files'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', MAX_FILES, { limits: { fileSize: MAX_FILE_BYTES } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], CareDocumentController.prototype, "addFiles", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCareDocumentDto]),
    __metadata("design:returntype", void 0)
], CareDocumentController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/extract'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareDocumentController.prototype, "extract", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareDocumentController.prototype, "remove", null);
exports.CareDocumentController = CareDocumentController = __decorate([
    (0, swagger_1.ApiTags)('care/document'),
    (0, common_1.Controller)('care/documents'),
    __metadata("design:paramtypes", [care_document_service_1.CareDocumentService])
], CareDocumentController);
//# sourceMappingURL=care-document.controller.js.map