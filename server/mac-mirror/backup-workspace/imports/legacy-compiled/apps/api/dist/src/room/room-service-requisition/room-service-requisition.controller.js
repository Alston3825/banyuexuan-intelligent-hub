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
exports.RoomServiceRequisitionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const room_service_requisition_service_1 = require("./room-service-requisition.service");
const create_room_service_requisition_dto_1 = require("./dto/create-room-service-requisition.dto");
const query_room_service_requisition_dto_1 = require("./dto/query-room-service-requisition.dto");
let RoomServiceRequisitionController = class RoomServiceRequisitionController {
    roomServiceRequisitionService;
    constructor(roomServiceRequisitionService) {
        this.roomServiceRequisitionService = roomServiceRequisitionService;
    }
    findAll(query) {
        return this.roomServiceRequisitionService.findMany(query);
    }
    create(dto) {
        return this.roomServiceRequisitionService.create(dto);
    }
    fulfill(id) {
        return this.roomServiceRequisitionService.fulfill(id);
    }
};
exports.RoomServiceRequisitionController = RoomServiceRequisitionController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('room.service-requisition.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_room_service_requisition_dto_1.QueryRoomServiceRequisitionDto]),
    __metadata("design:returntype", void 0)
], RoomServiceRequisitionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('room.service-requisition.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_service_requisition_dto_1.CreateRoomServiceRequisitionDto]),
    __metadata("design:returntype", void 0)
], RoomServiceRequisitionController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/fulfill'),
    (0, require_permission_decorator_1.RequirePermission)('room.service-requisition.fulfill'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomServiceRequisitionController.prototype, "fulfill", null);
exports.RoomServiceRequisitionController = RoomServiceRequisitionController = __decorate([
    (0, swagger_1.ApiTags)('room/service-requisition'),
    (0, common_1.Controller)('room/service-requisitions'),
    __metadata("design:paramtypes", [room_service_requisition_service_1.RoomServiceRequisitionService])
], RoomServiceRequisitionController);
//# sourceMappingURL=room-service-requisition.controller.js.map