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
exports.RoomController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const room_service_1 = require("./room.service");
const create_room_dto_1 = require("./dto/create-room.dto");
const update_room_dto_1 = require("./dto/update-room.dto");
const query_room_dto_1 = require("./dto/query-room.dto");
const query_room_board_dto_1 = require("./dto/query-room-board.dto");
const maintenance_room_dto_1 = require("./dto/maintenance-room.dto");
const clean_room_dto_1 = require("./dto/clean-room.dto");
let RoomController = class RoomController {
    roomService;
    constructor(roomService) {
        this.roomService = roomService;
    }
    getBoard(query) {
        return this.roomService.getBoard(query);
    }
    findAll(query) {
        return this.roomService.findMany(query);
    }
    deleteCheck(id) {
        return this.roomService.getDeleteCheck(id);
    }
    findOne(id) {
        return this.roomService.findOneOrThrow(id);
    }
    create(dto) {
        return this.roomService.create(dto);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.roomService.update(id, data, version);
    }
    setMaintenance(id, dto) {
        return this.roomService.setMaintenance(id, dto.underMaintenance, dto.note, dto.version);
    }
    markCleaned(id, dto) {
        return this.roomService.markCleaned(id, dto.version);
    }
    async remove(id, confirmRoomNo) {
        await this.roomService.remove(id, confirmRoomNo);
        return { success: true };
    }
};
exports.RoomController = RoomController;
__decorate([
    (0, common_1.Get)('board'),
    (0, require_permission_decorator_1.RequirePermission)('room.room.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_room_board_dto_1.QueryRoomBoardDto]),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "getBoard", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('room.room.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_room_dto_1.QueryRoomDto]),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/delete-check'),
    (0, require_permission_decorator_1.RequirePermission)('room.room.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "deleteCheck", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('room.room.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('room.room.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_dto_1.CreateRoomDto]),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('room.room.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_room_dto_1.UpdateRoomDto]),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/maintenance'),
    (0, require_permission_decorator_1.RequirePermission)('room.room.maintenance'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, maintenance_room_dto_1.MaintenanceRoomDto]),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "setMaintenance", null);
__decorate([
    (0, common_1.Patch)(':id/clean'),
    (0, require_permission_decorator_1.RequirePermission)('room.room.clean'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, clean_room_dto_1.CleanRoomDto]),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "markCleaned", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('room.room.delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('confirmRoomNo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "remove", null);
exports.RoomController = RoomController = __decorate([
    (0, swagger_1.ApiTags)('room/room'),
    (0, common_1.Controller)('room/rooms'),
    __metadata("design:paramtypes", [room_service_1.RoomService])
], RoomController);
//# sourceMappingURL=room.controller.js.map