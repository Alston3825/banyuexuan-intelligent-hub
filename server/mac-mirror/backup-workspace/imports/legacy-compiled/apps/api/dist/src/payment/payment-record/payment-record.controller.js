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
exports.PaymentRecordController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const payment_record_service_1 = require("./payment-record.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const query_payment_dto_1 = require("./dto/query-payment.dto");
const query_payment_summary_dto_1 = require("./dto/query-payment-summary.dto");
const request_refund_payment_dto_1 = require("./dto/request-refund-payment.dto");
let PaymentRecordController = class PaymentRecordController {
    paymentRecordService;
    constructor(paymentRecordService) {
        this.paymentRecordService = paymentRecordService;
    }
    getContractSummary(query) {
        return this.paymentRecordService.getContractSummary(query.contractId);
    }
    findAll(query) {
        return this.paymentRecordService.findMany(query);
    }
    findOne(id) {
        return this.paymentRecordService.findOneOrThrow(id);
    }
    create(dto) {
        return this.paymentRecordService.create(dto);
    }
    requestRefund(id, dto) {
        return this.paymentRecordService.requestRefund(id, dto.refundReason, dto.version);
    }
};
exports.PaymentRecordController = PaymentRecordController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, require_permission_decorator_1.RequirePermission)('payment.record.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_payment_summary_dto_1.QueryPaymentSummaryDto]),
    __metadata("design:returntype", void 0)
], PaymentRecordController.prototype, "getContractSummary", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('payment.record.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_payment_dto_1.QueryPaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentRecordController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('payment.record.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentRecordController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('payment.record.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentRecordController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, require_permission_decorator_1.RequirePermission)('payment.record.refund'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, request_refund_payment_dto_1.RequestRefundPaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentRecordController.prototype, "requestRefund", null);
exports.PaymentRecordController = PaymentRecordController = __decorate([
    (0, swagger_1.ApiTags)('payment/record'),
    (0, common_1.Controller)('payment/records'),
    __metadata("design:paramtypes", [payment_record_service_1.PaymentRecordService])
], PaymentRecordController);
//# sourceMappingURL=payment-record.controller.js.map