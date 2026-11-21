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
exports.RoomOutingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const room_outing_service_1 = require("./room-outing.service");
const create_room_outing_dto_1 = require("./dto/create-room-outing.dto");
const query_room_outing_dto_1 = require("./dto/query-room-outing.dto");
const version_dto_1 = require("./dto/version.dto");
const cancel_room_outing_dto_1 = require("./dto/cancel-room-outing.dto");
let RoomOutingController = class RoomOutingController {
    roomOutingService;
    constructor(roomOutingService) {
        this.roomOutingService = roomOutingService;
    }
    findAll(query) {
        return this.roomOutingService.findMany(query);
    }
    create(dto) {
        return this.roomOutingService.create(dto);
    }
    checkOut(id, dto) {
        return this.roomOutingService.checkOut(id, dto.version);
    }
    checkBack(id, dto) {
        return this.roomOutingService.checkBack(id, dto.version);
    }
    cancel(id, dto) {
        return this.roomOutingService.cancel(id, dto.cancelReason, dto.version);
    }
};
exports.RoomOutingController = RoomOutingController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('room.outing.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_room_outing_dto_1.QueryRoomOutingDto]),
    __metadata("design:returntype", void 0)
], RoomOutingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('room.outing.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_outing_dto_1.CreateRoomOutingDto]),
    __metadata("design:returntype", void 0)
], RoomOutingController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/check-out'),
    (0, require_permission_decorator_1.RequirePermission)('room.outing.checkout'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], RoomOutingController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Post)(':id/check-back'),
    (0, require_permission_decorator_1.RequirePermission)('room.outing.checkback'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], RoomOutingController.prototype, "checkBack", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('room.outing.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_room_outing_dto_1.CancelRoomOutingDto]),
    __metadata("design:returntype", void 0)
], RoomOutingController.prototype, "cancel", null);
exports.RoomOutingController = RoomOutingController = __decorate([
    (0, swagger_1.ApiTags)('room/outing'),
    (0, common_1.Controller)('room/outings'),
    __metadata("design:paramtypes", [room_outing_service_1.RoomOutingService])
], RoomOutingController);
//# sourceMappingURL=room-outing.controller.js.map