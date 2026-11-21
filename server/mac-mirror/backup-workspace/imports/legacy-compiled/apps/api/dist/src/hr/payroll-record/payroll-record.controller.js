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
exports.PayrollRecordController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const payroll_record_service_1 = require("./payroll-record.service");
const create_payroll_record_dto_1 = require("./dto/create-payroll-record.dto");
const query_payroll_record_dto_1 = require("./dto/query-payroll-record.dto");
const cancel_payroll_record_dto_1 = require("./dto/cancel-payroll-record.dto");
const version_dto_1 = require("./dto/version.dto");
let PayrollRecordController = class PayrollRecordController {
    payrollRecordService;
    constructor(payrollRecordService) {
        this.payrollRecordService = payrollRecordService;
    }
    findAll(query) {
        return this.payrollRecordService.findMany(query);
    }
    findOne(id) {
        return this.payrollRecordService.findOneOrThrow(id);
    }
    create(dto) {
        return this.payrollRecordService.create(dto);
    }
    submit(id, dto) {
        return this.payrollRecordService.submit(id, dto.version);
    }
    markPaid(id, dto) {
        return this.payrollRecordService.markPaid(id, dto.version);
    }
    cancel(id, dto) {
        return this.payrollRecordService.cancel(id, dto.cancelReason, dto.version);
    }
};
exports.PayrollRecordController = PayrollRecordController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('hr.payroll-record.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_payroll_record_dto_1.QueryPayrollRecordDto]),
    __metadata("design:returntype", void 0)
], PayrollRecordController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('hr.payroll-record.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayrollRecordController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('hr.payroll-record.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payroll_record_dto_1.CreatePayrollRecordDto]),
    __metadata("design:returntype", void 0)
], PayrollRecordController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, require_permission_decorator_1.RequirePermission)('hr.payroll-record.submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], PayrollRecordController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/mark-paid'),
    (0, require_permission_decorator_1.RequirePermission)('hr.payroll-record.mark-paid'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], PayrollRecordController.prototype, "markPaid", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('hr.payroll-record.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_payroll_record_dto_1.CancelPayrollRecordDto]),
    __metadata("design:returntype", void 0)
], PayrollRecordController.prototype, "cancel", null);
exports.PayrollRecordController = PayrollRecordController = __decorate([
    (0, swagger_1.ApiTags)('hr/payroll-record'),
    (0, common_1.Controller)('hr/payroll-records'),
    __metadata("design:paramtypes", [payroll_record_service_1.PayrollRecordService])
], PayrollRecordController);
//# sourceMappingURL=payroll-record.controller.js.map