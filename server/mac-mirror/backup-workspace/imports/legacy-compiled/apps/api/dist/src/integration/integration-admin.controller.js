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
exports.IntegrationAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
const integration_admin_service_1 = require("./integration-admin.service");
let IntegrationAdminController = class IntegrationAdminController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    systems() { return this.svc.listSystems(); }
    createSystem(dto) { return this.svc.createSystem(dto); }
    updateSystem(id, dto) { return this.svc.updateSystem(id, dto); }
    resetKey(id) { return this.svc.resetKey(id); }
    bindings(storeId, roomId) { return this.svc.listBindings(storeId, roomId); }
    addBinding(dto) { return this.svc.addBinding(dto); }
    removeBinding(id) { return this.svc.removeBinding(id); }
    serviceCodes() { return this.svc.listServiceCodes(); }
    upsertServiceCode(dto) { return this.svc.upsertServiceCode(dto); }
    calls(q) { return this.svc.listCalls({ ...q, take: q.take ? Number(q.take) : undefined }); }
};
exports.IntegrationAdminController = IntegrationAdminController;
__decorate([
    (0, common_1.Get)('systems'),
    (0, require_permission_decorator_1.RequirePermission)('integration.system.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IntegrationAdminController.prototype, "systems", null);
__decorate([
    (0, common_1.Post)('systems'),
    (0, require_permission_decorator_1.RequirePermission)('integration.system.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationAdminController.prototype, "createSystem", null);
__decorate([
    (0, common_1.Patch)('systems/:id'),
    (0, require_permission_decorator_1.RequirePermission)('integration.system.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IntegrationAdminController.prototype, "updateSystem", null);
__decorate([
    (0, common_1.Post)('systems/:id/reset-key'),
    (0, require_permission_decorator_1.RequirePermission)('integration.system.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IntegrationAdminController.prototype, "resetKey", null);
__decorate([
    (0, common_1.Get)('room-bindings'),
    (0, require_permission_decorator_1.RequirePermission)('integration.binding.view'),
    __param(0, (0, common_1.Query)('storeId')),
    __param(1, (0, common_1.Query)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], IntegrationAdminController.prototype, "bindings", null);
__decorate([
    (0, common_1.Post)('room-bindings'),
    (0, require_permission_decorator_1.RequirePermission)('integration.binding.update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationAdminController.prototype, "addBinding", null);
__decorate([
    (0, common_1.Delete)('room-bindings/:id'),
    (0, require_permission_decorator_1.RequirePermission)('integration.binding.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IntegrationAdminController.prototype, "removeBinding", null);
__decorate([
    (0, common_1.Get)('service-codes'),
    (0, require_permission_decorator_1.RequirePermission)('integration.system.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IntegrationAdminController.prototype, "serviceCodes", null);
__decorate([
    (0, common_1.Post)('service-codes'),
    (0, require_permission_decorator_1.RequirePermission)('integration.system.update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationAdminController.prototype, "upsertServiceCode", null);
__decorate([
    (0, common_1.Get)('calls'),
    (0, require_permission_decorator_1.RequirePermission)('integration.system.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationAdminController.prototype, "calls", null);
exports.IntegrationAdminController = IntegrationAdminController = __decorate([
    (0, swagger_1.ApiTags)('integration/admin'),
    (0, common_1.Controller)('integration'),
    __metadata("design:paramtypes", [integration_admin_service_1.IntegrationAdminService])
], IntegrationAdminController);
//# sourceMappingURL=integration-admin.controller.js.map