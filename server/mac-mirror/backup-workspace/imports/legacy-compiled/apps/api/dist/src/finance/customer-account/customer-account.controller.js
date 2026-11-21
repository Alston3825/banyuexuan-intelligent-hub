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
exports.CustomerAccountController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const customer_account_service_1 = require("./customer-account.service");
const recharge_customer_account_dto_1 = require("./dto/recharge-customer-account.dto");
const consume_customer_account_dto_1 = require("./dto/consume-customer-account.dto");
const refund_customer_account_dto_1 = require("./dto/refund-customer-account.dto");
const adjust_customer_account_dto_1 = require("./dto/adjust-customer-account.dto");
let CustomerAccountController = class CustomerAccountController {
    customerAccountService;
    constructor(customerAccountService) {
        this.customerAccountService = customerAccountService;
    }
    findByCustomer(customerId) {
        return this.customerAccountService.findByCustomer(customerId);
    }
    listTransactions(customerId) {
        return this.customerAccountService.listTransactions(customerId);
    }
    recharge(dto) {
        return this.customerAccountService.recharge(dto);
    }
    consume(dto) {
        return this.customerAccountService.consume(dto);
    }
    refund(dto) {
        return this.customerAccountService.refund(dto);
    }
    adjust(dto) {
        return this.customerAccountService.adjust(dto);
    }
};
exports.CustomerAccountController = CustomerAccountController;
__decorate([
    (0, common_1.Get)(':customerId'),
    (0, require_permission_decorator_1.RequirePermission)('finance.customer-account.view'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerAccountController.prototype, "findByCustomer", null);
__decorate([
    (0, common_1.Get)(':customerId/transactions'),
    (0, require_permission_decorator_1.RequirePermission)('finance.customer-account.view'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerAccountController.prototype, "listTransactions", null);
__decorate([
    (0, common_1.Post)('recharge'),
    (0, require_permission_decorator_1.RequirePermission)('finance.customer-account.recharge'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recharge_customer_account_dto_1.RechargeCustomerAccountDto]),
    __metadata("design:returntype", void 0)
], CustomerAccountController.prototype, "recharge", null);
__decorate([
    (0, common_1.Post)('consume'),
    (0, require_permission_decorator_1.RequirePermission)('finance.customer-account.consume'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [consume_customer_account_dto_1.ConsumeCustomerAccountDto]),
    __metadata("design:returntype", void 0)
], CustomerAccountController.prototype, "consume", null);
__decorate([
    (0, common_1.Post)('refund'),
    (0, require_permission_decorator_1.RequirePermission)('finance.customer-account.refund'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refund_customer_account_dto_1.RefundCustomerAccountDto]),
    __metadata("design:returntype", void 0)
], CustomerAccountController.prototype, "refund", null);
__decorate([
    (0, common_1.Post)('adjust'),
    (0, require_permission_decorator_1.RequirePermission)('finance.customer-account.adjust'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [adjust_customer_account_dto_1.AdjustCustomerAccountDto]),
    __metadata("design:returntype", void 0)
], CustomerAccountController.prototype, "adjust", null);
exports.CustomerAccountController = CustomerAccountController = __decorate([
    (0, swagger_1.ApiTags)('finance/customer-account'),
    (0, common_1.Controller)('finance/customer-accounts'),
    __metadata("design:paramtypes", [customer_account_service_1.CustomerAccountService])
], CustomerAccountController);
//# sourceMappingURL=customer-account.controller.js.map