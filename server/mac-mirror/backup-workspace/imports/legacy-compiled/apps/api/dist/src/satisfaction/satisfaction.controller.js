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
exports.SatisfactionController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
const satisfaction_service_1 = require("./satisfaction.service");
const MAX_FILE_BYTES = 30 * 1024 * 1024;
class FilterDto {
    templateId;
    from;
    to;
    storeId;
    steward;
    status;
    keyword;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterDto.prototype, "templateId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterDto.prototype, "storeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterDto.prototype, "steward", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterDto.prototype, "keyword", void 0);
class CreateDto {
    templateId;
    customerId;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDto.prototype, "templateId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDto.prototype, "customerId", void 0);
class PatchDto {
    customerId;
    customerName;
    roomNo;
    stewardName;
    nurseName;
    phone;
    surveyDate;
    scores;
    suggestion;
    praise;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PatchDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PatchDto.prototype, "customerName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PatchDto.prototype, "roomNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PatchDto.prototype, "stewardName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PatchDto.prototype, "nurseName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PatchDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PatchDto.prototype, "surveyDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], PatchDto.prototype, "scores", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PatchDto.prototype, "suggestion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], PatchDto.prototype, "praise", void 0);
let SatisfactionController = class SatisfactionController {
    service;
    constructor(service) {
        this.service = service;
    }
    specs() {
        return this.service.specs();
    }
    stats(q) {
        return this.service.stats(q);
    }
    comments(q) {
        return this.service.comments(q);
    }
    summarize(q) {
        return this.service.summarize(q);
    }
    list(q) {
        return this.service.list(q);
    }
    create(files, dto) {
        return this.service.create(files, dto);
    }
    findOne(id) {
        return this.service.getOne(id);
    }
    async file(id, fileId, res) {
        const { stream, size, mimeType, fileName } = await this.service.openFile(id, fileId);
        res.set({ 'Content-Type': mimeType, 'Content-Length': String(size), 'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`, 'Cache-Control': 'private, max-age=3600' });
        return new common_1.StreamableFile(stream);
    }
    addFiles(id, files) {
        return this.service.addFiles(id, files);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    confirm(id) {
        return this.service.confirm(id);
    }
    unconfirm(id) {
        return this.service.unconfirm(id);
    }
    extract(id) {
        return this.service.reextract(id);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.SatisfactionController = SatisfactionController;
__decorate([
    (0, common_1.Get)('specs'),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SatisfactionController.prototype, "specs", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FilterDto]),
    __metadata("design:returntype", void 0)
], SatisfactionController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('comments'),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FilterDto]),
    __metadata("design:returntype", void 0)
], SatisfactionController.prototype, "comments", null);
__decorate([
    (0, common_1.Post)('summarize'),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.view'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FilterDto]),
    __metadata("design:returntype", void 0)
], SatisfactionController.prototype, "summarize", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FilterDto]),
    __metadata("design:returntype", void 0)
], SatisfactionController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.create'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, { limits: { fileSize: MAX_FILE_BYTES } })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, CreateDto]),
    __metadata("design:returntype", void 0)
], SatisfactionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SatisfactionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/files/:fileId'),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.view'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SatisfactionController.prototype, "file", null);
__decorate([
    (0, common_1.Post)(':id/files'),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.update'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, { limits: { fileSize: MAX_FILE_BYTES } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], SatisfactionController.prototype, "addFiles", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, PatchDto]),
    __metadata("design:returntype", void 0)
], SatisfactionController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SatisfactionController.prototype, "confirm", null);
__decorate([
    (0, common_1.Post)(':id/unconfirm'),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SatisfactionController.prototype, "unconfirm", null);
__decorate([
    (0, common_1.Post)(':id/extract'),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SatisfactionController.prototype, "extract", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, require_permission_decorator_1.RequirePermission)('satisfaction.survey.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SatisfactionController.prototype, "remove", null);
exports.SatisfactionController = SatisfactionController = __decorate([
    (0, swagger_1.ApiTags)('satisfaction'),
    (0, common_1.Controller)('satisfaction/surveys'),
    __metadata("design:paramtypes", [satisfaction_service_1.SatisfactionService])
], SatisfactionController);
//# sourceMappingURL=satisfaction.controller.js.map