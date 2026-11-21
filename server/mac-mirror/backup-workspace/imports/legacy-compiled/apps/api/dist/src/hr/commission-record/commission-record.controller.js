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
exports.CommissionRecordController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const commission_record_service_1 = require("./commission-record.service");
const create_commission_record_dto_1 = require("./dto/create-commission-record.dto");
const query_commission_record_dto_1 = require("./dto/query-commission-record.dto");
const cancel_commission_record_dto_1 = require("./dto/cancel-commission-record.dto");
const version_dto_1 = require("./dto/version.dto");
let CommissionRecordController = class CommissionRecordController {
    commissionRecordService;
    constructor(commissionRecordService) {
        this.commissionRecordService = commissionRecordService;
    }
    findAll(query) {
        return this.commissionRecordService.findMany(query);
    }
    findOne(id) {
        return this.commissionRecordService.findOneOrThrow(id);
    }
    create(dto) {
        return this.commissionRecordService.create(dto);
    }
    submit(id, dto) {
        return this.commissionRecordService.submit(id, dto.version);
    }
    cancel(id, dto) {
        return this.commissionRecordService.cancel(id, dto.cancelReason, dto.version);
    }
};
exports.CommissionRecordController = CommissionRecordController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('hr.commission-record.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_commission_record_dto_1.QueryCommissionRecordDto]),
    __metadata("design:returntype", void 0)
], CommissionRecordController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('hr.commission-record.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommissionRecordController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('hr.commission-record.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_commission_record_dto_1.CreateCommissionRecordDto]),
    __metadata("design:returntype", void 0)
], CommissionRecordController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, require_permission_decorator_1.RequirePermission)('hr.commission-record.submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], CommissionRecordController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('hr.commission-record.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_commission_record_dto_1.CancelCommissionRecordDto]),
    __metadata("design:returntype", void 0)
], CommissionRecordController.prototype, "cancel", null);
exports.CommissionRecordController = CommissionRecordController = __decorate([
    (0, swagger_1.ApiTags)('hr/commission-record'),
    (0, common_1.Controller)('hr/commission-records'),
    __metadata("design:paramtypes", [commission_record_service_1.CommissionRecordService])
], CommissionRecordController);
//# sourceMappingURL=commission-record.controller.js.map