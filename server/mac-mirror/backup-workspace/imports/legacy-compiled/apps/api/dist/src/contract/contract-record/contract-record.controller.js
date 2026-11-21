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
exports.ContractRecordController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const contract_record_service_1 = require("./contract-record.service");
const update_contract_dto_1 = require("./dto/update-contract.dto");
const confirm_contract_dto_1 = require("./dto/confirm-contract.dto");
const void_contract_dto_1 = require("./dto/void-contract.dto");
const query_contract_dto_1 = require("./dto/query-contract.dto");
const upload_contract_dto_1 = require("./dto/upload-contract.dto");
const MAX_FILE_BYTES = 30 * 1024 * 1024;
const MAX_FILES = 30;
let ContractRecordController = class ContractRecordController {
    contractRecordService;
    constructor(contractRecordService) {
        this.contractRecordService = contractRecordService;
    }
    findAll(query) {
        return this.contractRecordService.findMany(query);
    }
    upload(files, dto) {
        return this.contractRecordService.createFromUpload(files, dto.storeId);
    }
    createManual(dto) {
        return this.contractRecordService.createManual(dto.storeId);
    }
    findOne(id) {
        return this.contractRecordService.getDetail(id);
    }
    customerMatches(id) {
        return this.contractRecordService.customerMatches(id);
    }
    async file(id, fileId, res) {
        const { stream, size, mimeType, fileName } = await this.contractRecordService.openFile(id, fileId);
        res.set({
            'Content-Type': mimeType,
            'Content-Length': String(size),
            'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
            'Cache-Control': 'private, max-age=3600',
        });
        return new common_1.StreamableFile(stream);
    }
    update(id, dto) {
        return this.contractRecordService.update(id, dto);
    }
    reextract(id) {
        return this.contractRecordService.reextract(id);
    }
    confirm(id, dto) {
        return this.contractRecordService.confirm(id, dto);
    }
    void(id, dto) {
        return this.contractRecordService.void(id, dto.voidReason, dto.version);
    }
    async remove(id) {
        await this.contractRecordService.remove(id);
        return { success: true };
    }
};
exports.ContractRecordController = ContractRecordController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('contract.record.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_contract_dto_1.QueryContractDto]),
    __metadata("design:returntype", void 0)
], ContractRecordController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, require_permission_decorator_1.RequirePermission)('contract.record.upload'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', MAX_FILES, { limits: { fileSize: MAX_FILE_BYTES } })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, upload_contract_dto_1.UploadContractDto]),
    __metadata("design:returntype", void 0)
], ContractRecordController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('manual'),
    (0, require_permission_decorator_1.RequirePermission)('contract.record.upload'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upload_contract_dto_1.CreateManualContractDto]),
    __metadata("design:returntype", void 0)
], ContractRecordController.prototype, "createManual", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('contract.record.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractRecordController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/customer-matches'),
    (0, require_permission_decorator_1.RequirePermission)('contract.record.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractRecordController.prototype, "customerMatches", null);
__decorate([
    (0, common_1.Get)(':id/files/:fileId'),
    (0, require_permission_decorator_1.RequirePermission)('contract.record.view'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fileId')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ContractRecordController.prototype, "file", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('contract.record.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_contract_dto_1.UpdateContractDto]),
    __metadata("design:returntype", void 0)
], ContractRecordController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/reextract'),
    (0, require_permission_decorator_1.RequirePermission)('contract.record.upload'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractRecordController.prototype, "reextract", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    (0, require_permission_decorator_1.RequirePermission)('contract.record.confirm'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, confirm_contract_dto_1.ConfirmContractDto]),
    __metadata("design:returntype", void 0)
], ContractRecordController.prototype, "confirm", null);
__decorate([
    (0, common_1.Post)(':id/void'),
    (0, require_permission_decorator_1.RequirePermission)('contract.record.void'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, void_contract_dto_1.VoidContractDto]),
    __metadata("design:returntype", void 0)
], ContractRecordController.prototype, "void", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('contract.record.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractRecordController.prototype, "remove", null);
exports.ContractRecordController = ContractRecordController = __decorate([
    (0, swagger_1.ApiTags)('contract/record'),
    (0, common_1.Controller)('contract/records'),
    __metadata("design:paramtypes", [contract_record_service_1.ContractRecordService])
], ContractRecordController);
//# sourceMappingURL=contract-record.controller.js.map