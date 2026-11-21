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
exports.VehicleBookingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const vehicle_booking_service_1 = require("./vehicle-booking.service");
const create_vehicle_booking_dto_1 = require("./dto/create-vehicle-booking.dto");
const query_vehicle_booking_dto_1 = require("./dto/query-vehicle-booking.dto");
const cancel_vehicle_booking_dto_1 = require("./dto/cancel-vehicle-booking.dto");
let VehicleBookingController = class VehicleBookingController {
    vehicleBookingService;
    constructor(vehicleBookingService) {
        this.vehicleBookingService = vehicleBookingService;
    }
    findAll(query) {
        return this.vehicleBookingService.findMany(query);
    }
    findOne(id) {
        return this.vehicleBookingService.findOneOrThrow(id);
    }
    create(dto) {
        return this.vehicleBookingService.create(dto);
    }
    cancel(id, dto) {
        return this.vehicleBookingService.cancel(id, dto.cancelReason, dto.version);
    }
};
exports.VehicleBookingController = VehicleBookingController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('logistics.vehicle-booking.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_vehicle_booking_dto_1.QueryVehicleBookingDto]),
    __metadata("design:returntype", void 0)
], VehicleBookingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('logistics.vehicle-booking.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehicleBookingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('logistics.vehicle-booking.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_booking_dto_1.CreateVehicleBookingDto]),
    __metadata("design:returntype", void 0)
], VehicleBookingController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('logistics.vehicle-booking.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_vehicle_booking_dto_1.CancelVehicleBookingDto]),
    __metadata("design:returntype", void 0)
], VehicleBookingController.prototype, "cancel", null);
exports.VehicleBookingController = VehicleBookingController = __decorate([
    (0, swagger_1.ApiTags)('logistics/vehicle-booking'),
    (0, common_1.Controller)('logistics/vehicle-bookings'),
    __metadata("design:paramtypes", [vehicle_booking_service_1.VehicleBookingService])
], VehicleBookingController);
//# sourceMappingURL=vehicle-booking.controller.js.map