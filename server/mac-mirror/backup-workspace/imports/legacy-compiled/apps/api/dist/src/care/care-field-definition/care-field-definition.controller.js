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
exports.CareFieldDefinitionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_field_definition_service_1 = require("./care-field-definition.service");
const create_care_field_definition_dto_1 = require("./dto/create-care-field-definition.dto");
const update_care_field_definition_dto_1 = require("./dto/update-care-field-definition.dto");
const query_care_field_definition_dto_1 = require("./dto/query-care-field-definition.dto");
let CareFieldDefinitionController = class CareFieldDefinitionController {
    careFieldDefinitionService;
    constructor(careFieldDefinitionService) {
        this.careFieldDefinitionService = careFieldDefinitionService;
    }
    findAll(query) {
        return this.careFieldDefinitionService.findMany(query);
    }
    findOne(id) {
        return this.careFieldDefinitionService.findOneOrThrow(id);
    }
    create(dto) {
        return this.careFieldDefinitionService.create(dto);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.careFieldDefinitionService.update(id, data, version);
    }
};
exports.CareFieldDefinitionController = CareFieldDefinitionController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('care.field.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_care_field_definition_dto_1.QueryCareFieldDefinitionDto]),
    __metadata("design:returntype", void 0)
], CareFieldDefinitionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.field.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareFieldDefinitionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('care.field.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_care_field_definition_dto_1.CreateCareFieldDefinitionDto]),
    __metadata("design:returntype", void 0)
], CareFieldDefinitionController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.field.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_care_field_definition_dto_1.UpdateCareFieldDefinitionDto]),
    __metadata("design:returntype", void 0)
], CareFieldDefinitionController.prototype, "update", null);
exports.CareFieldDefinitionController = CareFieldDefinitionController = __decorate([
    (0, swagger_1.ApiTags)('care/field'),
    (0, common_1.Controller)('care/fields'),
    __metadata("design:paramtypes", [care_field_definition_service_1.CareFieldDefinitionService])
], CareFieldDefinitionController);
//# sourceMappingURL=care-field-definition.controller.js.map