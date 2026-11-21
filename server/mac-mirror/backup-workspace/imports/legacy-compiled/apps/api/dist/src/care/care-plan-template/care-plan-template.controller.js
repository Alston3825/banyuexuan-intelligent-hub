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
exports.CarePlanTemplateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_plan_template_service_1 = require("./care-plan-template.service");
const create_care_plan_template_dto_1 = require("./dto/create-care-plan-template.dto");
const update_care_plan_template_dto_1 = require("./dto/update-care-plan-template.dto");
const query_care_plan_template_dto_1 = require("./dto/query-care-plan-template.dto");
let CarePlanTemplateController = class CarePlanTemplateController {
    carePlanTemplateService;
    constructor(carePlanTemplateService) {
        this.carePlanTemplateService = carePlanTemplateService;
    }
    findAll(query) {
        return this.carePlanTemplateService.findMany(query);
    }
    findOne(id) {
        return this.carePlanTemplateService.findOneOrThrow(id);
    }
    create(dto) {
        return this.carePlanTemplateService.create(dto);
    }
    update(id, dto) {
        return this.carePlanTemplateService.update(id, dto);
    }
};
exports.CarePlanTemplateController = CarePlanTemplateController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('care.plan-template.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_care_plan_template_dto_1.QueryCarePlanTemplateDto]),
    __metadata("design:returntype", void 0)
], CarePlanTemplateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.plan-template.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarePlanTemplateController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('care.plan-template.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_care_plan_template_dto_1.CreateCarePlanTemplateDto]),
    __metadata("design:returntype", void 0)
], CarePlanTemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.plan-template.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_care_plan_template_dto_1.UpdateCarePlanTemplateDto]),
    __metadata("design:returntype", void 0)
], CarePlanTemplateController.prototype, "update", null);
exports.CarePlanTemplateController = CarePlanTemplateController = __decorate([
    (0, swagger_1.ApiTags)('care/plan-template'),
    (0, common_1.Controller)('care/plan-templates'),
    __metadata("design:paramtypes", [care_plan_template_service_1.CarePlanTemplateService])
], CarePlanTemplateController);
//# sourceMappingURL=care-plan-template.controller.js.map