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
exports.CarePlanController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_plan_service_1 = require("./care-plan.service");
const create_care_plan_dto_1 = require("./dto/create-care-plan.dto");
const query_care_plan_dto_1 = require("./dto/query-care-plan.dto");
const terminate_care_plan_dto_1 = require("./dto/terminate-care-plan.dto");
let CarePlanController = class CarePlanController {
    carePlanService;
    constructor(carePlanService) {
        this.carePlanService = carePlanService;
    }
    findAll(query) {
        return this.carePlanService.findMany(query);
    }
    findOne(id) {
        return this.carePlanService.findOneOrThrow(id);
    }
    create(dto) {
        return this.carePlanService.create(dto);
    }
    terminate(id, dto) {
        return this.carePlanService.terminate(id, dto.reason, dto.version);
    }
};
exports.CarePlanController = CarePlanController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('care.plan.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_care_plan_dto_1.QueryCarePlanDto]),
    __metadata("design:returntype", void 0)
], CarePlanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.plan.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarePlanController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('care.plan.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_care_plan_dto_1.CreateCarePlanDto]),
    __metadata("design:returntype", void 0)
], CarePlanController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/terminate'),
    (0, require_permission_decorator_1.RequirePermission)('care.plan.terminate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, terminate_care_plan_dto_1.TerminateCarePlanDto]),
    __metadata("design:returntype", void 0)
], CarePlanController.prototype, "terminate", null);
exports.CarePlanController = CarePlanController = __decorate([
    (0, swagger_1.ApiTags)('care/plan'),
    (0, common_1.Controller)('care/plans'),
    __metadata("design:paramtypes", [care_plan_service_1.CarePlanService])
], CarePlanController);
//# sourceMappingURL=care-plan.controller.js.map