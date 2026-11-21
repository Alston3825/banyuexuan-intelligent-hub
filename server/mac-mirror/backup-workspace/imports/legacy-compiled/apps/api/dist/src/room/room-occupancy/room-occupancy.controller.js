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
exports.RoomOccupancyController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const room_occupancy_service_1 = require("./room-occupancy.service");
const create_room_occupancy_dto_1 = require("./dto/create-room-occupancy.dto");
const query_room_occupancy_dto_1 = require("./dto/query-room-occupancy.dto");
const check_in_room_occupancy_dto_1 = require("./dto/check-in-room-occupancy.dto");
const check_out_room_occupancy_dto_1 = require("./dto/check-out-room-occupancy.dto");
const cancel_room_occupancy_dto_1 = require("./dto/cancel-room-occupancy.dto");
const reschedule_room_occupancy_dto_1 = require("./dto/reschedule-room-occupancy.dto");
class ChangeRoomDto {
    roomId;
    version;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangeRoomDto.prototype, "roomId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ChangeRoomDto.prototype, "version", void 0);
let RoomOccupancyController = class RoomOccupancyController {
    roomOccupancyService;
    constructor(roomOccupancyService) {
        this.roomOccupancyService = roomOccupancyService;
    }
    findAll(query) {
        return this.roomOccupancyService.findMany(query);
    }
    conflicts(storeId) {
        return this.roomOccupancyService.findConflicts(storeId);
    }
    freeRooms(id) {
        return this.roomOccupancyService.freeRooms(id);
    }
    checkInRooms(id, from, to) {
        return this.roomOccupancyService.checkInRooms(id, from, to);
    }
    findOne(id) {
        return this.roomOccupancyService.findOneOrThrow(id);
    }
    create(dto) {
        return this.roomOccupancyService.create(dto);
    }
    checkIn(id, dto) {
        return this.roomOccupancyService.checkIn(id, dto);
    }
    checkOut(id, dto) {
        return this.roomOccupancyService.checkOut(id, dto.version);
    }
    cancel(id, dto) {
        return this.roomOccupancyService.cancel(id, dto.cancelReason, dto.version);
    }
    changeRoom(id, dto) {
        return this.roomOccupancyService.changeRoom(id, dto.roomId, dto.version);
    }
    reschedule(id, dto) {
        return this.roomOccupancyService.reschedule(id, dto);
    }
};
exports.RoomOccupancyController = RoomOccupancyController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('room.occupancy.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_room_occupancy_dto_1.QueryRoomOccupancyDto]),
    __metadata("design:returntype", void 0)
], RoomOccupancyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('conflicts'),
    (0, require_permission_decorator_1.RequirePermission)('room.occupancy.view'),
    __param(0, (0, common_1.Query)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomOccupancyController.prototype, "conflicts", null);
__decorate([
    (0, common_1.Get)(':id/free-rooms'),
    (0, require_permission_decorator_1.RequirePermission)('room.occupancy.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomOccupancyController.prototype, "freeRooms", null);
__decorate([
    (0, common_1.Get)(':id/checkin-rooms'),
    (0, require_permission_decorator_1.RequirePermission)('room.occupancy.view'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], RoomOccupancyController.prototype, "checkInRooms", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('room.occupancy.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomOccupancyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('room.occupancy.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_occupancy_dto_1.CreateRoomOccupancyDto]),
    __metadata("design:returntype", void 0)
], RoomOccupancyController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/check-in'),
    (0, require_permission_decorator_1.RequirePermission)('room.occupancy.checkin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, check_in_room_occupancy_dto_1.CheckInRoomOccupancyDto]),
    __metadata("design:returntype", void 0)
], RoomOccupancyController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)(':id/check-out'),
    (0, require_permission_decorator_1.RequirePermission)('room.occupancy.checkout'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, check_out_room_occupancy_dto_1.CheckOutRoomOccupancyDto]),
    __metadata("design:returntype", void 0)
], RoomOccupancyController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('room.occupancy.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_room_occupancy_dto_1.CancelRoomOccupancyDto]),
    __metadata("design:returntype", void 0)
], RoomOccupancyController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/change-room'),
    (0, require_permission_decorator_1.RequirePermission)('room.occupancy.reschedule'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ChangeRoomDto]),
    __metadata("design:returntype", void 0)
], RoomOccupancyController.prototype, "changeRoom", null);
__decorate([
    (0, common_1.Patch)(':id/reschedule'),
    (0, require_permission_decorator_1.RequirePermission)('room.occupancy.reschedule'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reschedule_room_occupancy_dto_1.RescheduleRoomOccupancyDto]),
    __metadata("design:returntype", void 0)
], RoomOccupancyController.prototype, "reschedule", null);
exports.RoomOccupancyController = RoomOccupancyController = __decorate([
    (0, swagger_1.ApiTags)('room/occupancy'),
    (0, common_1.Controller)('room/occupancies'),
    __metadata("design:paramtypes", [room_occupancy_service_1.RoomOccupancyService])
], RoomOccupancyController);
//# sourceMappingURL=room-occupancy.controller.js.map