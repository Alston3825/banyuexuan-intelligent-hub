"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomModule = void 0;
const common_1 = require("@nestjs/common");
const room_type_module_1 = require("./room-type/room-type.module");
const room_module_1 = require("./room/room.module");
const room_occupancy_module_1 = require("./room-occupancy/room-occupancy.module");
const room_call_module_1 = require("./room-call/room-call.module");
const room_outing_module_1 = require("./room-outing/room-outing.module");
const room_service_requisition_module_1 = require("./room-service-requisition/room-service-requisition.module");
let RoomModule = class RoomModule {
};
exports.RoomModule = RoomModule;
exports.RoomModule = RoomModule = __decorate([
    (0, common_1.Module)({
        imports: [room_type_module_1.RoomTypeModule, room_module_1.RoomEntityModule, room_occupancy_module_1.RoomOccupancyModule, room_call_module_1.RoomCallModule, room_outing_module_1.RoomOutingModule, room_service_requisition_module_1.RoomServiceRequisitionModule],
    })
], RoomModule);
//# sourceMappingURL=room.module.js.map