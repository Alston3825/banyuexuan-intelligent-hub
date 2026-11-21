"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const room_call_module_1 = require("../../room/room-call/room-call.module");
const utility_expense_module_1 = require("../../logistics/utility-expense/utility-expense.module");
const device_gateway_controller_1 = require("./device-gateway.controller");
const device_gateway_service_1 = require("./device-gateway.service");
let DeviceGatewayModule = class DeviceGatewayModule {
};
exports.DeviceGatewayModule = DeviceGatewayModule;
exports.DeviceGatewayModule = DeviceGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [room_call_module_1.RoomCallModule, utility_expense_module_1.UtilityExpenseModule],
        controllers: [device_gateway_controller_1.DeviceGatewayController],
        providers: [device_gateway_service_1.DeviceGatewayService],
        exports: [device_gateway_service_1.DeviceGatewayService],
    })
], DeviceGatewayModule);
//# sourceMappingURL=device-gateway.module.js.map