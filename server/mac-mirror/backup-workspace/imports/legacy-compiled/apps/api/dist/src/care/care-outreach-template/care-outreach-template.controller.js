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
exports.CareOutreachTemplateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_outreach_template_service_1 = require("./care-outreach-template.service");
const create_care_outreach_template_dto_1 = require("./dto/create-care-outreach-template.dto");
const update_care_outreach_template_dto_1 = require("./dto/update-care-outreach-template.dto");
let CareOutreachTemplateController = class CareOutreachTemplateController {
    careOutreachTemplateService;
    constructor(careOutreachTemplateService) {
        this.careOutreachTemplateService = careOutreachTemplateService;
    }
    findAll() {
        return this.careOutreachTemplateService.findMany();
    }
    findOne(id) {
        return this.careOutreachTemplateService.findOneOrThrow(id);
    }
    create(dto) {
        return this.careOutreachTemplateService.create(dto);
    }
    update(id, dto) {
        return this.careOutreachTemplateService.update(id, dto);
    }
};
exports.CareOutreachTemplateController = CareOutreachTemplateController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('care.outreach-template.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CareOutreachTemplateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.outreach-template.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareOutreachTemplateController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('care.outreach-template.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_care_outreach_template_dto_1.CreateCareOutreachTemplateDto]),
    __metadata("design:returntype", void 0)
], CareOutreachTemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.outreach-template.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_care_outreach_template_dto_1.UpdateCareOutreachTemplateDto]),
    __metadata("design:returntype", void 0)
], CareOutreachTemplateController.prototype, "update", null);
exports.CareOutreachTemplateController = CareOutreachTemplateController = __decorate([
    (0, swagger_1.ApiTags)('care/outreach-template'),
    (0, common_1.Controller)('care/outreach-templates'),
    __metadata("design:paramtypes", [care_outreach_template_service_1.CareOutreachTemplateService])
], CareOutreachTemplateController);
//# sourceMappingURL=care-outreach-template.controller.js.map