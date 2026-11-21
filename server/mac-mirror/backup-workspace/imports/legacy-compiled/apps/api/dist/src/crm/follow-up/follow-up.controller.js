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
exports.FollowUpController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const follow_up_service_1 = require("./follow-up.service");
const create_follow_up_dto_1 = require("./dto/create-follow-up.dto");
const query_follow_up_dto_1 = require("./dto/query-follow-up.dto");
let FollowUpController = class FollowUpController {
    followUpService;
    constructor(followUpService) {
        this.followUpService = followUpService;
    }
    findAll(query) {
        return this.followUpService.findMany(query.businessType, query.businessId);
    }
    create(dto) {
        return this.followUpService.create(dto);
    }
};
exports.FollowUpController = FollowUpController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('crm.follow-up.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_follow_up_dto_1.QueryFollowUpDto]),
    __metadata("design:returntype", void 0)
], FollowUpController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('crm.follow-up.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_follow_up_dto_1.CreateFollowUpDto]),
    __metadata("design:returntype", void 0)
], FollowUpController.prototype, "create", null);
exports.FollowUpController = FollowUpController = __decorate([
    (0, swagger_1.ApiTags)('crm/follow-up'),
    (0, common_1.Controller)('crm/follow-ups'),
    __metadata("design:paramtypes", [follow_up_service_1.FollowUpService])
], FollowUpController);
//# sourceMappingURL=follow-up.controller.js.map