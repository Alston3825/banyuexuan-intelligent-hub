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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParameterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const data_scope_service_1 = require("../../common/scope/data-scope.service");
const base_scoped_crud_service_1 = require("../../common/base/base-scoped-crud.service");
let ParameterService = class ParameterService extends base_scoped_crud_service_1.BaseScopedCrudService {
    prisma;
    dataScopeService;
    entityType = 'Parameter';
    constructor(prisma, dataScopeService, auditLogService, ctx) {
        super(auditLogService, ctx);
        this.prisma = prisma;
        this.dataScopeService = dataScopeService;
    }
    get delegate() {
        return this.prisma.parameter;
    }
    async create(data) {
        await this.dataScopeService.assertStoreAccessible(this.ctx, data.storeId);
        const existing = await this.prisma.parameter.findFirst({
            where: { tenantId: this.ctx.tenantId, storeId: data.storeId ?? null, key: data.key },
        });
        if (existing) {
            throw new common_1.ConflictException(`参数 key="${data.key}" 在该范围内已存在`);
        }
        return super.create({ ...data, tenantId: this.ctx.tenantId });
    }
};
exports.ParameterService = ParameterService;
exports.ParameterService = ParameterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        data_scope_service_1.DataScopeService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], ParameterService);
//# sourceMappingURL=parameter.service.js.map