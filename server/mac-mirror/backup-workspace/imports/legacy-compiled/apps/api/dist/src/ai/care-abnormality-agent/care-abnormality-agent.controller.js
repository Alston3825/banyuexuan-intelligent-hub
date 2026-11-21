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
exports.CareAbnormalityAgentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_abnormality_agent_service_1 = require("./care-abnormality-agent.service");
let CareAbnormalityAgentController = class CareAbnormalityAgentController {
    careAbnormalityAgentService;
    constructor(careAbnormalityAgentService) {
        this.careAbnormalityAgentService = careAbnormalityAgentService;
    }
    suggest(abnormalityId) {
        return this.careAbnormalityAgentService.suggest(abnormalityId);
    }
};
exports.CareAbnormalityAgentController = CareAbnormalityAgentController;
__decorate([
    (0, common_1.Post)(':abnormalityId/suggest'),
    (0, require_permission_decorator_1.RequirePermission)('ai.care-abnormality-agent.suggest'),
    __param(0, (0, common_1.Param)('abnormalityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareAbnormalityAgentController.prototype, "suggest", null);
exports.CareAbnormalityAgentController = CareAbnormalityAgentController = __decorate([
    (0, swagger_1.ApiTags)('ai/care-abnormality-agent'),
    (0, common_1.Controller)('ai/care-abnormality-agent'),
    __metadata("design:paramtypes", [care_abnormality_agent_service_1.CareAbnormalityAgentService])
], CareAbnormalityAgentController);
//# sourceMappingURL=care-abnormality-agent.controller.js.map