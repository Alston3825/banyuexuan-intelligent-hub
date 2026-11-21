"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const request_context_service_1 = require("./context/request-context.service");
const permission_lookup_service_1 = require("./context/permission-lookup.service");
const data_scope_service_1 = require("./scope/data-scope.service");
const audit_log_module_1 = require("../audit/audit-log.module");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [audit_log_module_1.AuditLogModule],
        providers: [request_context_service_1.RequestContextService, permission_lookup_service_1.PermissionLookupService, data_scope_service_1.DataScopeService],
        exports: [request_context_service_1.RequestContextService, permission_lookup_service_1.PermissionLookupService, data_scope_service_1.DataScopeService, audit_log_module_1.AuditLogModule],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map