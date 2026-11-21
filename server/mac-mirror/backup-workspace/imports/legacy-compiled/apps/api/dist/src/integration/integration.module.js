"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const api_key_guard_1 = require("./api-key.guard");
const integration_admin_controller_1 = require("./integration-admin.controller");
const integration_admin_service_1 = require("./integration-admin.service");
const integration_events_service_1 = require("./integration-events.service");
const integration_public_controller_1 = require("./integration-public.controller");
const integration_public_service_1 = require("./integration-public.service");
let IntegrationModule = class IntegrationModule {
};
exports.IntegrationModule = IntegrationModule;
exports.IntegrationModule = IntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [integration_admin_controller_1.IntegrationAdminController, integration_public_controller_1.IntegrationPublicController],
        providers: [api_key_guard_1.ApiKeyGuard, integration_admin_service_1.IntegrationAdminService, integration_public_service_1.IntegrationPublicService, integration_events_service_1.IntegrationEventsService],
        exports: [integration_events_service_1.IntegrationEventsService],
    })
], IntegrationModule);
//# sourceMappingURL=integration.module.js.map