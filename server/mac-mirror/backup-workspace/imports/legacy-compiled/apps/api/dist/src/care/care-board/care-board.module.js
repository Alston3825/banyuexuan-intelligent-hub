"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareBoardModule = void 0;
const common_1 = require("@nestjs/common");
const care_board_controller_1 = require("./care-board.controller");
const care_board_service_1 = require("./care-board.service");
const room_module_1 = require("../../room/room/room.module");
let CareBoardModule = class CareBoardModule {
};
exports.CareBoardModule = CareBoardModule;
exports.CareBoardModule = CareBoardModule = __decorate([
    (0, common_1.Module)({
        imports: [room_module_1.RoomEntityModule],
        controllers: [care_board_controller_1.CareBoardController],
        providers: [care_board_service_1.CareBoardService],
    })
], CareBoardModule);
//# sourceMappingURL=care-board.module.js.map