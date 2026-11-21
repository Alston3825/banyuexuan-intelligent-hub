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
exports.CustomerServiceAgentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const customer_service_agent_service_1 = require("./customer-service-agent.service");
const ask_customer_service_dto_1 = require("./dto/ask-customer-service.dto");
let CustomerServiceAgentController = class CustomerServiceAgentController {
    customerServiceAgentService;
    constructor(customerServiceAgentService) {
        this.customerServiceAgentService = customerServiceAgentService;
    }
    ask(dto) {
        return this.customerServiceAgentService.ask(dto);
    }
};
exports.CustomerServiceAgentController = CustomerServiceAgentController;
__decorate([
    (0, common_1.Post)('ask'),
    (0, require_permission_decorator_1.RequirePermission)('ai.customer-service-agent.ask'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ask_customer_service_dto_1.AskCustomerServiceDto]),
    __metadata("design:returntype", void 0)
], CustomerServiceAgentController.prototype, "ask", null);
exports.CustomerServiceAgentController = CustomerServiceAgentController = __decorate([
    (0, swagger_1.ApiTags)('ai/customer-service-agent'),
    (0, common_1.Controller)('ai/customer-service-agent'),
    __metadata("design:paramtypes", [customer_service_agent_service_1.CustomerServiceAgentService])
], CustomerServiceAgentController);
//# sourceMappingURL=customer-service-agent.controller.js.map