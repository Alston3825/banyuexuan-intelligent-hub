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
exports.OpportunityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const opportunity_service_1 = require("./opportunity.service");
const create_opportunity_dto_1 = require("./dto/create-opportunity.dto");
const update_opportunity_dto_1 = require("./dto/update-opportunity.dto");
const advance_stage_dto_1 = require("./dto/advance-stage.dto");
const lose_opportunity_dto_1 = require("./dto/lose-opportunity.dto");
const query_opportunity_dto_1 = require("./dto/query-opportunity.dto");
let OpportunityController = class OpportunityController {
    opportunityService;
    constructor(opportunityService) {
        this.opportunityService = opportunityService;
    }
    findAll(query) {
        return this.opportunityService.findMany(query);
    }
    findOne(id) {
        return this.opportunityService.findOneOrThrow(id);
    }
    create(dto) {
        return this.opportunityService.create(dto);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.opportunityService.update(id, data, version);
    }
    advanceStage(id, dto) {
        return this.opportunityService.advanceStage(id, dto.targetStage, dto.version);
    }
    lose(id, dto) {
        return this.opportunityService.lose(id, dto.lostReason, dto.version);
    }
};
exports.OpportunityController = OpportunityController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('crm.opportunity.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_opportunity_dto_1.QueryOpportunityDto]),
    __metadata("design:returntype", void 0)
], OpportunityController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('crm.opportunity.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OpportunityController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('crm.opportunity.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_opportunity_dto_1.CreateOpportunityDto]),
    __metadata("design:returntype", void 0)
], OpportunityController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('crm.opportunity.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_opportunity_dto_1.UpdateOpportunityDto]),
    __metadata("design:returntype", void 0)
], OpportunityController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/advance-stage'),
    (0, require_permission_decorator_1.RequirePermission)('crm.opportunity.advance-stage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, advance_stage_dto_1.AdvanceStageDto]),
    __metadata("design:returntype", void 0)
], OpportunityController.prototype, "advanceStage", null);
__decorate([
    (0, common_1.Post)(':id/lose'),
    (0, require_permission_decorator_1.RequirePermission)('crm.opportunity.lose'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lose_opportunity_dto_1.LoseOpportunityDto]),
    __metadata("design:returntype", void 0)
], OpportunityController.prototype, "lose", null);
exports.OpportunityController = OpportunityController = __decorate([
    (0, swagger_1.ApiTags)('crm/opportunity'),
    (0, common_1.Controller)('crm/opportunities'),
    __metadata("design:paramtypes", [opportunity_service_1.OpportunityService])
], OpportunityController);
//# sourceMappingURL=opportunity.controller.js.map