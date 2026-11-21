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
exports.DemoApprovalController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const demo_approval_service_1 = require("./demo-approval.service");
const create_demo_approval_dto_1 = require("./dto/create-demo-approval.dto");
let DemoApprovalController = class DemoApprovalController {
    demoApprovalService;
    constructor(demoApprovalService) {
        this.demoApprovalService = demoApprovalService;
    }
    findAll() {
        return this.demoApprovalService.findMany();
    }
    findOne(id) {
        return this.demoApprovalService.findOneOrThrow(id);
    }
    create(dto) {
        return this.demoApprovalService.create(dto);
    }
    submit(id) {
        return this.demoApprovalService.submit(id);
    }
};
exports.DemoApprovalController = DemoApprovalController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('workflow.demo-approval.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DemoApprovalController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.demo-approval.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DemoApprovalController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('workflow.demo-approval.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_demo_approval_dto_1.CreateDemoApprovalDto]),
    __metadata("design:returntype", void 0)
], DemoApprovalController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, require_permission_decorator_1.RequirePermission)('workflow.demo-approval.create'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DemoApprovalController.prototype, "submit", null);
exports.DemoApprovalController = DemoApprovalController = __decorate([
    (0, swagger_1.ApiTags)('workflow/demo-approval'),
    (0, common_1.Controller)('demo-approvals'),
    __metadata("design:paramtypes", [demo_approval_service_1.DemoApprovalService])
], DemoApprovalController);
//# sourceMappingURL=demo-approval.controller.js.map