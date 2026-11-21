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
exports.ExpenseClaimController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const expense_claim_service_1 = require("./expense-claim.service");
const create_expense_claim_dto_1 = require("./dto/create-expense-claim.dto");
const query_expense_claim_dto_1 = require("./dto/query-expense-claim.dto");
const cancel_expense_claim_dto_1 = require("./dto/cancel-expense-claim.dto");
const version_dto_1 = require("./dto/version.dto");
let ExpenseClaimController = class ExpenseClaimController {
    expenseClaimService;
    constructor(expenseClaimService) {
        this.expenseClaimService = expenseClaimService;
    }
    findAll(query) {
        return this.expenseClaimService.findMany(query);
    }
    findOne(id) {
        return this.expenseClaimService.findOneOrThrow(id);
    }
    create(dto) {
        return this.expenseClaimService.create(dto);
    }
    submit(id, dto) {
        return this.expenseClaimService.submit(id, dto.version);
    }
    cancel(id, dto) {
        return this.expenseClaimService.cancel(id, dto.cancelReason, dto.version);
    }
};
exports.ExpenseClaimController = ExpenseClaimController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('office.expense-claim.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_expense_claim_dto_1.QueryExpenseClaimDto]),
    __metadata("design:returntype", void 0)
], ExpenseClaimController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('office.expense-claim.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpenseClaimController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('office.expense-claim.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expense_claim_dto_1.CreateExpenseClaimDto]),
    __metadata("design:returntype", void 0)
], ExpenseClaimController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, require_permission_decorator_1.RequirePermission)('office.expense-claim.submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], ExpenseClaimController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('office.expense-claim.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_expense_claim_dto_1.CancelExpenseClaimDto]),
    __metadata("design:returntype", void 0)
], ExpenseClaimController.prototype, "cancel", null);
exports.ExpenseClaimController = ExpenseClaimController = __decorate([
    (0, swagger_1.ApiTags)('office/expense-claim'),
    (0, common_1.Controller)('office/expense-claims'),
    __metadata("design:paramtypes", [expense_claim_service_1.ExpenseClaimService])
], ExpenseClaimController);
//# sourceMappingURL=expense-claim.controller.js.map