"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const health_module_1 = require("./health/health.module");
const prisma_module_1 = require("./prisma/prisma.module");
const common_module_1 = require("./common/common.module");
const queue_module_1 = require("./queue/queue.module");
const auth_module_1 = require("./auth/auth.module");
const platform_module_1 = require("./platform/platform.module");
const workflow_module_1 = require("./workflow/workflow.module");
const workspace_module_1 = require("./workspace/workspace.module");
const crm_module_1 = require("./crm/crm.module");
const contract_module_1 = require("./contract/contract.module");
const room_module_1 = require("./room/room.module");
const payment_module_1 = require("./payment/payment.module");
const satisfaction_module_1 = require("./satisfaction/satisfaction.module");
const care_module_1 = require("./care/care.module");
const meal_module_1 = require("./meal/meal.module");
const service_module_1 = require("./service/service.module");
const inventory_module_1 = require("./inventory/inventory.module");
const hr_module_1 = require("./hr/hr.module");
const finance_module_1 = require("./finance/finance.module");
const office_module_1 = require("./office/office.module");
const logistics_module_1 = require("./logistics/logistics.module");
const ai_module_1 = require("./ai/ai.module");
const iot_module_1 = require("./iot/iot.module");
const integration_module_1 = require("./integration/integration.module");
const analytics_module_1 = require("./analytics/analytics.module");
const training_module_1 = require("./training/training.module");
const recycle_bin_module_1 = require("./common/recycle/recycle-bin.module");
const env_validation_1 = require("./config/env.validation");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const permission_guard_1 = require("./common/guards/permission.guard");
const field_mask_interceptor_1 = require("./common/interceptors/field-mask.interceptor");
const audit_log_interceptor_1 = require("./common/interceptors/audit-log.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, validate: env_validation_1.validateEnv }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
            prisma_module_1.PrismaModule,
            common_module_1.CommonModule,
            queue_module_1.QueueModule,
            auth_module_1.AuthModule,
            platform_module_1.PlatformModule,
            workflow_module_1.WorkflowModule,
            workspace_module_1.WorkspaceModule,
            crm_module_1.CrmModule,
            recycle_bin_module_1.RecycleBinModule,
            contract_module_1.ContractModule,
            room_module_1.RoomModule,
            payment_module_1.PaymentModule,
            care_module_1.CareModule,
            satisfaction_module_1.SatisfactionModule,
            meal_module_1.MealModule,
            service_module_1.ServiceModule,
            inventory_module_1.InventoryModule,
            hr_module_1.HrModule,
            finance_module_1.FinanceModule,
            office_module_1.OfficeModule,
            logistics_module_1.LogisticsModule,
            ai_module_1.AiModule,
            iot_module_1.IotModule,
            integration_module_1.IntegrationModule,
            analytics_module_1.AnalyticsModule,
            training_module_1.TrainingModule,
            health_module_1.HealthModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: permission_guard_1.PermissionGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: field_mask_interceptor_1.FieldMaskInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: audit_log_interceptor_1.AuditLogInterceptor },
            { provide: core_1.APP_FILTER, useClass: http_exception_filter_1.HttpExceptionFilter },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map