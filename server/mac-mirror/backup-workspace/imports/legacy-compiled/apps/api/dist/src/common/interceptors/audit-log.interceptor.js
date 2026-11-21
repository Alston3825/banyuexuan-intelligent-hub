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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const audit_sensitive_query_decorator_1 = require("../decorators/audit-sensitive-query.decorator");
const audit_log_service_1 = require("../../audit/audit-log.service");
let AuditLogInterceptor = class AuditLogInterceptor {
    reflector;
    auditLogService;
    constructor(reflector, auditLogService) {
        this.reflector = reflector;
        this.auditLogService = auditLogService;
    }
    intercept(context, next) {
        const isSensitiveQuery = this.reflector.getAllAndOverride(audit_sensitive_query_decorator_1.AUDIT_SENSITIVE_QUERY_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!isSensitiveQuery)
            return next.handle();
        const request = context.switchToHttp().getRequest();
        const entityType = context.getClass().name.replace('Controller', '');
        return next.handle().pipe((0, rxjs_1.tap)(() => {
            void this.auditLogService.record({
                action: 'SENSITIVE_QUERY',
                entityType,
                tenantId: request.user?.tenantId,
                storeId: request.user?.storeId,
                accountId: request.user?.accountId,
                ip: request.ip,
                userAgent: request.headers?.['user-agent'],
                requestId: request.requestId,
                remark: `${request.method} ${request.url}`,
            });
        }));
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object, audit_log_service_1.AuditLogService])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map