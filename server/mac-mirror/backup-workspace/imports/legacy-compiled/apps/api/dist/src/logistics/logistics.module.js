"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogisticsModule = void 0;
const common_1 = require("@nestjs/common");
const vehicle_module_1 = require("./vehicle/vehicle.module");
const vehicle_booking_module_1 = require("./vehicle-booking/vehicle-booking.module");
const utility_expense_module_1 = require("./utility-expense/utility-expense.module");
let LogisticsModule = class LogisticsModule {
};
exports.LogisticsModule = LogisticsModule;
exports.LogisticsModule = LogisticsModule = __decorate([
    (0, common_1.Module)({
        imports: [vehicle_module_1.VehicleModule, vehicle_booking_module_1.VehicleBookingModule, utility_expense_module_1.UtilityExpenseModule],
    })
], LogisticsModule);
//# sourceMappingURL=logistics.module.js.map