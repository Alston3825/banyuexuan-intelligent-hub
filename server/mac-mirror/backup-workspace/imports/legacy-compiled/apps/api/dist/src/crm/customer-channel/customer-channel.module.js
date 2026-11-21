"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerChannelModule = void 0;
const common_1 = require("@nestjs/common");
const customer_channel_controller_1 = require("./customer-channel.controller");
const customer_channel_service_1 = require("./customer-channel.service");
let CustomerChannelModule = class CustomerChannelModule {
};
exports.CustomerChannelModule = CustomerChannelModule;
exports.CustomerChannelModule = CustomerChannelModule = __decorate([
    (0, common_1.Module)({
        controllers: [customer_channel_controller_1.CustomerChannelController],
        providers: [customer_channel_service_1.CustomerChannelService, customer_channel_service_1.CustomerChannelTypeService],
        exports: [customer_channel_service_1.CustomerChannelService, customer_channel_service_1.CustomerChannelTypeService],
    })
], CustomerChannelModule);
//# sourceMappingURL=customer-channel.module.js.map