"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomServiceRequisitionModule = void 0;
const common_1 = require("@nestjs/common");
const room_service_requisition_controller_1 = require("./room-service-requisition.controller");
const room_service_requisition_service_1 = require("./room-service-requisition.service");
let RoomServiceRequisitionModule = class RoomServiceRequisitionModule {
};
exports.RoomServiceRequisitionModule = RoomServiceRequisitionModule;
exports.RoomServiceRequisitionModule = RoomServiceRequisitionModule = __decorate([
    (0, common_1.Module)({
        controllers: [room_service_requisition_controller_1.RoomServiceRequisitionController],
        providers: [room_service_requisition_service_1.RoomServiceRequisitionService],
        exports: [room_service_requisition_service_1.RoomServiceRequisitionService],
    })
], RoomServiceRequisitionModule);
//# sourceMappingURL=room-service-requisition.module.js.map