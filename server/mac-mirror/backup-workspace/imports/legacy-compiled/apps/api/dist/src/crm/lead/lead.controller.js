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
exports.LeadController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const lead_service_1 = require("./lead.service");
const create_lead_dto_1 = require("./dto/create-lead.dto");
const update_lead_dto_1 = require("./dto/update-lead.dto");
const assign_lead_dto_1 = require("./dto/assign-lead.dto");
const convert_lead_dto_1 = require("./dto/convert-lead.dto");
const lose_lead_dto_1 = require("./dto/lose-lead.dto");
const query_lead_dto_1 = require("./dto/query-lead.dto");
let LeadController = class LeadController {
    leadService;
    constructor(leadService) {
        this.leadService = leadService;
    }
    findAll(query) {
        return this.leadService.findMany(query);
    }
    findOne(id) {
        return this.leadService.findOneOrThrow(id);
    }
    create(dto) {
        return this.leadService.create(dto);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.leadService.update(id, data, version);
    }
    assign(id, dto) {
        return this.leadService.assign(id, dto.assignedToId, dto.version);
    }
    convert(id, dto) {
        return this.leadService.convert(id, dto.version);
    }
    lose(id, dto) {
        return this.leadService.lose(id, dto.lostReason, dto.version);
    }
};
exports.LeadController = LeadController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('crm.lead.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_lead_dto_1.QueryLeadDto]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('crm.lead.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('crm.lead.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lead_dto_1.CreateLeadDto]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('crm.lead.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_lead_dto_1.UpdateLeadDto]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, require_permission_decorator_1.RequirePermission)('crm.lead.assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_lead_dto_1.AssignLeadDto]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/convert'),
    (0, require_permission_decorator_1.RequirePermission)('crm.lead.convert'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, convert_lead_dto_1.ConvertLeadDto]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "convert", null);
__decorate([
    (0, common_1.Post)(':id/lose'),
    (0, require_permission_decorator_1.RequirePermission)('crm.lead.lose'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lose_lead_dto_1.LoseLeadDto]),
    __metadata("design:returntype", void 0)
], LeadController.prototype, "lose", null);
exports.LeadController = LeadController = __decorate([
    (0, swagger_1.ApiTags)('crm/lead'),
    (0, common_1.Controller)('crm/leads'),
    __metadata("design:paramtypes", [lead_service_1.LeadService])
], LeadController);
//# sourceMappingURL=lead.controller.js.map