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
exports.DeviceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const base_scoped_crud_service_1 = require("../../common/base/base-scoped-crud.service");
const data_scope_service_1 = require("../../common/scope/data-scope.service");
let DeviceService = class DeviceService extends base_scoped_crud_service_1.BaseScopedCrudService {
    prisma;
    dataScopeService;
    entityType = 'Device';
    constructor(prisma, dataScopeService, auditLogService, ctx) {
        super(auditLogService, ctx);
        this.prisma = prisma;
        this.dataScopeService = dataScopeService;
    }
    get delegate() {
        return this.prisma.device;
    }
    async findMany(query = {}) {
        if (query.storeId) {
            await this.dataScopeService.assertStoreAccessible(this.ctx, query.storeId);
            return this.prisma.device.findMany({ where: { tenantId: this.ctx.tenantId, storeId: query.storeId }, orderBy: { createdAt: 'desc' } });
        }
        const allowed = await this.dataScopeService.resolveAllowedStoreIds(this.ctx);
        return this.prisma.device.findMany({
            where: { tenantId: this.ctx.tenantId, storeId: allowed === 'ALL' ? undefined : { in: allowed } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data) {
        const deviceType = await this.prisma.deviceType.findUnique({ where: { id: data.deviceTypeId } });
        if (!deviceType)
            throw new common_1.NotFoundException(`DeviceType ${data.deviceTypeId} 不存在`);
        const device = await super.create({ ...data, tenantId: this.ctx.tenantId });
        await this.prisma.deviceShadow.create({ data: { deviceId: device.id } });
        return device;
    }
};
exports.DeviceService = DeviceService;
exports.DeviceService = DeviceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        data_scope_service_1.DataScopeService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], DeviceService);
//# sourceMappingURL=device.service.js.map