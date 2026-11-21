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
exports.CustomerChannelController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const customer_channel_service_1 = require("./customer-channel.service");
const customer_channel_dto_1 = require("./dto/customer-channel.dto");
let CustomerChannelController = class CustomerChannelController {
    channelService;
    typeService;
    constructor(channelService, typeService) {
        this.channelService = channelService;
        this.typeService = typeService;
    }
    findTypes() {
        return this.typeService.list();
    }
    createType(dto) {
        return this.typeService.createType(dto);
    }
    updateType(id, dto) {
        return this.typeService.updateType(id, dto);
    }
    removeType(id) {
        return this.typeService.removeType(id);
    }
    findAll(query) {
        return this.channelService.list(query);
    }
    create(dto) {
        return this.channelService.createChannel(dto);
    }
    update(id, dto) {
        return this.channelService.updateChannel(id, dto);
    }
    remove(id) {
        return this.channelService.removeChannel(id);
    }
};
exports.CustomerChannelController = CustomerChannelController;
__decorate([
    (0, common_1.Get)('customer-channel-types'),
    (0, require_permission_decorator_1.RequirePermission)('crm.channel.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerChannelController.prototype, "findTypes", null);
__decorate([
    (0, common_1.Post)('customer-channel-types'),
    (0, require_permission_decorator_1.RequirePermission)('crm.channel.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_channel_dto_1.CreateChannelTypeDto]),
    __metadata("design:returntype", void 0)
], CustomerChannelController.prototype, "createType", null);
__decorate([
    (0, common_1.Patch)('customer-channel-types/:id'),
    (0, require_permission_decorator_1.RequirePermission)('crm.channel.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_channel_dto_1.UpdateChannelTypeDto]),
    __metadata("design:returntype", void 0)
], CustomerChannelController.prototype, "updateType", null);
__decorate([
    (0, common_1.Delete)('customer-channel-types/:id'),
    (0, common_1.HttpCode)(204),
    (0, require_permission_decorator_1.RequirePermission)('crm.channel.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerChannelController.prototype, "removeType", null);
__decorate([
    (0, common_1.Get)('customer-channels'),
    (0, require_permission_decorator_1.RequirePermission)('crm.channel.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_channel_dto_1.QueryCustomerChannelDto]),
    __metadata("design:returntype", void 0)
], CustomerChannelController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('customer-channels'),
    (0, require_permission_decorator_1.RequirePermission)('crm.channel.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_channel_dto_1.CreateCustomerChannelDto]),
    __metadata("design:returntype", void 0)
], CustomerChannelController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('customer-channels/:id'),
    (0, require_permission_decorator_1.RequirePermission)('crm.channel.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_channel_dto_1.UpdateCustomerChannelDto]),
    __metadata("design:returntype", void 0)
], CustomerChannelController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('customer-channels/:id'),
    (0, common_1.HttpCode)(204),
    (0, require_permission_decorator_1.RequirePermission)('crm.channel.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerChannelController.prototype, "remove", null);
exports.CustomerChannelController = CustomerChannelController = __decorate([
    (0, swagger_1.ApiTags)('crm/customer-channel'),
    (0, common_1.Controller)('crm'),
    __metadata("design:paramtypes", [customer_channel_service_1.CustomerChannelService,
        customer_channel_service_1.CustomerChannelTypeService])
], CustomerChannelController);
//# sourceMappingURL=customer-channel.controller.js.map