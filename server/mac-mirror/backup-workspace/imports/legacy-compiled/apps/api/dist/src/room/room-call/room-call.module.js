"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomCallModule = void 0;
const common_1 = require("@nestjs/common");
const room_call_controller_1 = require("./room-call.controller");
const room_call_service_1 = require("./room-call.service");
let RoomCallModule = class RoomCallModule {
};
exports.RoomCallModule = RoomCallModule;
exports.RoomCallModule = RoomCallModule = __decorate([
    (0, common_1.Module)({
        controllers: [room_call_controller_1.RoomCallController],
        providers: [room_call_service_1.RoomCallService],
        exports: [room_call_service_1.RoomCallService],
    })
], RoomCallModule);
//# sourceMappingURL=room-call.module.js.map