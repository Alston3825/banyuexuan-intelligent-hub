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
exports.ScheduleEntryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const schedule_entry_service_1 = require("./schedule-entry.service");
const create_schedule_entry_dto_1 = require("./dto/create-schedule-entry.dto");
const update_schedule_entry_dto_1 = require("./dto/update-schedule-entry.dto");
const query_schedule_entry_dto_1 = require("./dto/query-schedule-entry.dto");
let ScheduleEntryController = class ScheduleEntryController {
    scheduleEntryService;
    constructor(scheduleEntryService) {
        this.scheduleEntryService = scheduleEntryService;
    }
    findAll(query) {
        return this.scheduleEntryService.findMany(query);
    }
    create(dto) {
        return this.scheduleEntryService.create(dto);
    }
    update(id, dto) {
        return this.scheduleEntryService.update(id, dto);
    }
    delete(id) {
        return this.scheduleEntryService.delete(id);
    }
};
exports.ScheduleEntryController = ScheduleEntryController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('hr.schedule-entry.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_schedule_entry_dto_1.QueryScheduleEntryDto]),
    __metadata("design:returntype", void 0)
], ScheduleEntryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('hr.schedule-entry.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_schedule_entry_dto_1.CreateScheduleEntryDto]),
    __metadata("design:returntype", void 0)
], ScheduleEntryController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('hr.schedule-entry.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_schedule_entry_dto_1.UpdateScheduleEntryDto]),
    __metadata("design:returntype", void 0)
], ScheduleEntryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('hr.schedule-entry.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScheduleEntryController.prototype, "delete", null);
exports.ScheduleEntryController = ScheduleEntryController = __decorate([
    (0, swagger_1.ApiTags)('hr/schedule-entry'),
    (0, common_1.Controller)('hr/schedule-entries'),
    __metadata("design:paramtypes", [schedule_entry_service_1.ScheduleEntryService])
], ScheduleEntryController);
//# sourceMappingURL=schedule-entry.controller.js.map