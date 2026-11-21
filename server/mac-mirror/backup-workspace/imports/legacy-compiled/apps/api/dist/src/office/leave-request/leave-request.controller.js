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
exports.LeaveRequestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const leave_request_service_1 = require("./leave-request.service");
const create_leave_request_dto_1 = require("./dto/create-leave-request.dto");
const query_leave_request_dto_1 = require("./dto/query-leave-request.dto");
const cancel_leave_request_dto_1 = require("./dto/cancel-leave-request.dto");
const version_dto_1 = require("./dto/version.dto");
let LeaveRequestController = class LeaveRequestController {
    leaveRequestService;
    constructor(leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }
    findAll(query) {
        return this.leaveRequestService.findMany(query);
    }
    findOne(id) {
        return this.leaveRequestService.findOneOrThrow(id);
    }
    create(dto) {
        return this.leaveRequestService.create(dto);
    }
    submit(id, dto) {
        return this.leaveRequestService.submit(id, dto.version);
    }
    cancel(id, dto) {
        return this.leaveRequestService.cancel(id, dto.cancelReason, dto.version);
    }
};
exports.LeaveRequestController = LeaveRequestController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('office.leave-request.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_leave_request_dto_1.QueryLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], LeaveRequestController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('office.leave-request.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveRequestController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('office.leave-request.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_leave_request_dto_1.CreateLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], LeaveRequestController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, require_permission_decorator_1.RequirePermission)('office.leave-request.submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], LeaveRequestController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('office.leave-request.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_leave_request_dto_1.CancelLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], LeaveRequestController.prototype, "cancel", null);
exports.LeaveRequestController = LeaveRequestController = __decorate([
    (0, swagger_1.ApiTags)('office/leave-request'),
    (0, common_1.Controller)('office/leave-requests'),
    __metadata("design:paramtypes", [leave_request_service_1.LeaveRequestService])
], LeaveRequestController);
//# sourceMappingURL=leave-request.controller.js.map