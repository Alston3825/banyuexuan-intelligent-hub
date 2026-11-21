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
exports.RoomCallController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const room_call_service_1 = require("./room-call.service");
const create_room_call_dto_1 = require("./dto/create-room-call.dto");
const query_room_call_dto_1 = require("./dto/query-room-call.dto");
let RoomCallController = class RoomCallController {
    roomCallService;
    constructor(roomCallService) {
        this.roomCallService = roomCallService;
    }
    findAll(query) {
        return this.roomCallService.findMany(query);
    }
    create(dto) {
        return this.roomCallService.create(dto);
    }
    handle(id) {
        return this.roomCallService.handle(id);
    }
};
exports.RoomCallController = RoomCallController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('room.call.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_room_call_dto_1.QueryRoomCallDto]),
    __metadata("design:returntype", void 0)
], RoomCallController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('room.call.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_call_dto_1.CreateRoomCallDto]),
    __metadata("design:returntype", void 0)
], RoomCallController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/handle'),
    (0, require_permission_decorator_1.RequirePermission)('room.call.handle'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomCallController.prototype, "handle", null);
exports.RoomCallController = RoomCallController = __decorate([
    (0, swagger_1.ApiTags)('room/call'),
    (0, common_1.Controller)('room/calls'),
    __metadata("design:paramtypes", [room_call_service_1.RoomCallService])
], RoomCallController);
//# sourceMappingURL=room-call.controller.js.map