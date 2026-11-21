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
exports.DeviceGatewayController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const device_gateway_service_1 = require("./device-gateway.service");
const report_device_event_dto_1 = require("./dto/report-device-event.dto");
const issue_device_command_dto_1 = require("./dto/issue-device-command.dto");
let DeviceGatewayController = class DeviceGatewayController {
    deviceGatewayService;
    constructor(deviceGatewayService) {
        this.deviceGatewayService = deviceGatewayService;
    }
    findEvents(deviceId, storeId) {
        return this.deviceGatewayService.findEvents({ deviceId, storeId });
    }
    reportEvent(dto) {
        return this.deviceGatewayService.reportEvent(dto);
    }
    getShadow(deviceId) {
        return this.deviceGatewayService.getShadow(deviceId);
    }
    issueCommand(deviceId, dto) {
        return this.deviceGatewayService.issueCommand(deviceId, dto.desiredState);
    }
    confirmCommand(deviceId) {
        return this.deviceGatewayService.confirmCommand(deviceId);
    }
};
exports.DeviceGatewayController = DeviceGatewayController;
__decorate([
    (0, common_1.Get)('events'),
    (0, require_permission_decorator_1.RequirePermission)('iot.device-event.view'),
    __param(0, (0, common_1.Query)('deviceId')),
    __param(1, (0, common_1.Query)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DeviceGatewayController.prototype, "findEvents", null);
__decorate([
    (0, common_1.Post)('events'),
    (0, require_permission_decorator_1.RequirePermission)('iot.device-event.simulate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_device_event_dto_1.ReportDeviceEventDto]),
    __metadata("design:returntype", void 0)
], DeviceGatewayController.prototype, "reportEvent", null);
__decorate([
    (0, common_1.Get)('devices/:deviceId/shadow'),
    (0, require_permission_decorator_1.RequirePermission)('iot.device-event.view'),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeviceGatewayController.prototype, "getShadow", null);
__decorate([
    (0, common_1.Post)('devices/:deviceId/commands'),
    (0, require_permission_decorator_1.RequirePermission)('iot.device-event.issue-command'),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, issue_device_command_dto_1.IssueDeviceCommandDto]),
    __metadata("design:returntype", void 0)
], DeviceGatewayController.prototype, "issueCommand", null);
__decorate([
    (0, common_1.Post)('devices/:deviceId/commands/confirm'),
    (0, require_permission_decorator_1.RequirePermission)('iot.device-event.confirm-command'),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeviceGatewayController.prototype, "confirmCommand", null);
exports.DeviceGatewayController = DeviceGatewayController = __decorate([
    (0, swagger_1.ApiTags)('iot/device-gateway'),
    (0, common_1.Controller)('iot/gateway'),
    __metadata("design:paramtypes", [device_gateway_service_1.DeviceGatewayService])
], DeviceGatewayController);
//# sourceMappingURL=device-gateway.controller.js.map