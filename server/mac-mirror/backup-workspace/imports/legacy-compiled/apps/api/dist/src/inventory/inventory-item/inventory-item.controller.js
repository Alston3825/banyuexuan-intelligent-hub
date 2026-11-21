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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryItemController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const inventory_item_service_1 = require("./inventory-item.service");
const inventory_item_import_service_1 = require("./inventory-item-import.service");
const create_inventory_item_dto_1 = require("./dto/create-inventory-item.dto");
const update_inventory_item_dto_1 = require("./dto/update-inventory-item.dto");
class CommitImportDto {
    items;
    purpose;
    category;
    updateExisting;
}
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CommitImportDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.WarehousePurpose),
    __metadata("design:type", typeof (_a = typeof client_1.WarehousePurpose !== "undefined" && client_1.WarehousePurpose) === "function" ? _a : Object)
], CommitImportDto.prototype, "purpose", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommitImportDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CommitImportDto.prototype, "updateExisting", void 0);
let InventoryItemController = class InventoryItemController {
    inventoryItemService;
    importService;
    constructor(inventoryItemService, importService) {
        this.inventoryItemService = inventoryItemService;
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
    search(keyword) {
        return this.inventoryItemService.search(keyword);
    }
    similar(name, spec) {
        return this.inventoryItemService.similar(name, spec);
    }
    findAll() {
        return this.inventoryItemService.findMany();
    }
    findOne(id) {
        return this.inventoryItemService.findOneOrThrow(id);
    }
    create(dto) {
        return this.inventoryItemService.create(dto);
    }
    priceHistory(id) {
        return this.inventoryItemService.priceHistory(id);
    }
    async deleteCheck(id) {
        const { item: _item, ...rest } = await this.inventoryItemService.deleteCheck(id);
        return rest;
    }
    remove(id) {
        return this.inventoryItemService.remove(id);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.inventoryItemService.update(id, data, version);
    }
};
exports.InventoryItemController = InventoryItemController;
__decorate([
    (0, common_1.Post)('import/preview'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.item.create'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof Express !== "undefined" && (_b = Express.Multer) !== void 0 && _b.File) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], InventoryItemController.prototype, "importPreview", null);
__decorate([
    (0, common_1.Post)('import/commit'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.item.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CommitImportDto]),
    __metadata("design:returntype", void 0)
], InventoryItemController.prototype, "importCommit", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryItemController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('similar'),
    __param(0, (0, common_1.Query)('name')),
    __param(1, (0, common_1.Query)('spec')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InventoryItemController.prototype, "similar", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.item.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryItemController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.item.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryItemController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('inventory.item.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_inventory_item_dto_1.CreateInventoryItemDto]),
    __metadata("design:returntype", void 0)
], InventoryItemController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id/price-history'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryItemController.prototype, "priceHistory", null);
__decorate([
    (0, common_1.Get)(':id/delete-check'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.item.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryItemController.prototype, "deleteCheck", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.item.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryItemController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('inventory.item.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_inventory_item_dto_1.UpdateInventoryItemDto]),
    __metadata("design:returntype", void 0)
], InventoryItemController.prototype, "update", null);
exports.InventoryItemController = InventoryItemController = __decorate([
    (0, swagger_1.ApiTags)('inventory/item'),
    (0, common_1.Controller)('inventory/items'),
    __metadata("design:paramtypes", [inventory_item_service_1.InventoryItemService,
        inventory_item_import_service_1.InventoryItemImportService])
], InventoryItemController);
//# sourceMappingURL=inventory-item.controller.js.map