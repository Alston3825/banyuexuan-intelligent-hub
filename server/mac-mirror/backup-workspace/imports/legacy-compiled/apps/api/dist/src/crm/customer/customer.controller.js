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
exports.CustomerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const mask_entity_decorator_1 = require("../../common/decorators/mask-entity.decorator");
const audit_sensitive_query_decorator_1 = require("../../common/decorators/audit-sensitive-query.decorator");
const tag_service_1 = require("../../platform/tag/tag.service");
const customer_service_1 = require("./customer.service");
const create_customer_dto_1 = require("./dto/create-customer.dto");
const update_customer_dto_1 = require("./dto/update-customer.dto");
const merge_customer_dto_1 = require("./dto/merge-customer.dto");
const archive_customer_dto_1 = require("./dto/archive-customer.dto");
const query_customer_dto_1 = require("./dto/query-customer.dto");
const set_customer_tag_dto_1 = require("./dto/set-customer-tag.dto");
const CUSTOMER_ENTITY_TYPE = 'Customer';
let CustomerController = class CustomerController {
    customerService;
    tagService;
    constructor(customerService, tagService) {
        this.customerService = customerService;
        this.tagService = tagService;
    }
    findAll(query) {
        return this.customerService.findMany(query);
    }
    options() {
        return this.customerService.options();
    }
    tagCatalog(category) {
        return this.tagService.listByCategory(category);
    }
    staffOptions(keyword, salesOnly) {
        return this.customerService.staffOptions(keyword, salesOnly === '1');
    }
    referrerSearch(keyword = '') {
        return this.customerService.searchReferrers(keyword);
    }
    idCardCheck(idCardNo = '') {
        return this.customerService.checkIdCard(idCardNo);
    }
    mergePreview(sourceId, targetId) {
        return this.customerService.mergePreview(sourceId, targetId);
    }
    findOne(id) {
        return this.customerService.findOneOrThrow(id);
    }
    create(dto) {
        return this.customerService.create(dto);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.customerService.update(id, data, version);
    }
    deleteCheck(id) {
        return this.customerService.getDeleteCheck(id);
    }
    remove(id, confirmName) {
        return this.customerService.remove(id, confirmName);
    }
    merge(dto) {
        return this.customerService.merge(dto.sourceId, dto.targetId);
    }
    archive(id, dto) {
        return this.customerService.archive(id, dto.reason);
    }
    restore(id) {
        return this.customerService.restore(id);
    }
    listTags(id) {
        return this.tagService.listActiveBindings(CUSTOMER_ENTITY_TYPE, id);
    }
    listTagHistory(id, category) {
        return this.tagService.listBindingHistory(CUSTOMER_ENTITY_TYPE, id, category);
    }
    setTag(id, dto) {
        return this.tagService.setExclusiveTag(CUSTOMER_ENTITY_TYPE, id, dto.category, dto.tagId);
    }
    unbindTag(bindingId) {
        return this.tagService.unbind(bindingId);
    }
};
exports.CustomerController = CustomerController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.view'),
    (0, audit_sensitive_query_decorator_1.AuditSensitiveQuery)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_customer_dto_1.QueryCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('options'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "options", null);
__decorate([
    (0, common_1.Get)('tag-catalog'),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.view'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "tagCatalog", null);
__decorate([
    (0, common_1.Get)('staff-options'),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.view'),
    __param(0, (0, common_1.Query)('keyword')),
    __param(1, (0, common_1.Query)('salesOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "staffOptions", null);
__decorate([
    (0, common_1.Get)('referrer-search'),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.view'),
    __param(0, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "referrerSearch", null);
__decorate([
    (0, common_1.Get)('id-card-check'),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.view'),
    __param(0, (0, common_1.Query)('idCardNo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "idCardCheck", null);
__decorate([
    (0, common_1.Get)('merge-preview'),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.merge'),
    __param(0, (0, common_1.Query)('sourceId')),
    __param(1, (0, common_1.Query)('targetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "mergePreview", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.view'),
    (0, audit_sensitive_query_decorator_1.AuditSensitiveQuery)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id/delete-check'),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.archive'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "deleteCheck", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('confirmName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('merge'),
    (0, common_1.HttpCode)(204),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.merge'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merge_customer_dto_1.MergeCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "merge", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, common_1.HttpCode)(204),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.archive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, archive_customer_dto_1.ArchiveCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.HttpCode)(204),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.archive'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "restore", null);
__decorate([
    (0, common_1.Get)(':id/tags'),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "listTags", null);
__decorate([
    (0, common_1.Get)(':id/tags/history'),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.view'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "listTagHistory", null);
__decorate([
    (0, common_1.Post)(':id/tags'),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_customer_tag_dto_1.SetCustomerTagDto]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "setTag", null);
__decorate([
    (0, common_1.Delete)(':id/tags/:bindingId'),
    (0, require_permission_decorator_1.RequirePermission)('crm.customer.update'),
    __param(0, (0, common_1.Param)('bindingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "unbindTag", null);
exports.CustomerController = CustomerController = __decorate([
    (0, swagger_1.ApiTags)('crm/customer'),
    (0, common_1.Controller)('crm/customers'),
    (0, mask_entity_decorator_1.MaskEntity)('Customer'),
    __metadata("design:paramtypes", [customer_service_1.CustomerService,
        tag_service_1.TagService])
], CustomerController);
//# sourceMappingURL=customer.controller.js.map