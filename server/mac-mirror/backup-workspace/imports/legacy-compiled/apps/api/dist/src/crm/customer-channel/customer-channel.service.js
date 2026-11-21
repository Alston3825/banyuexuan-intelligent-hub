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
exports.CustomerChannelTypeService = exports.CustomerChannelService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/audit-log.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const base_scoped_crud_service_1 = require("../../common/base/base-scoped-crud.service");
let CustomerChannelService = class CustomerChannelService extends base_scoped_crud_service_1.BaseScopedCrudService {
    prisma;
    entityType = 'CustomerChannel';
    constructor(prisma, auditLogService, ctx) {
        super(auditLogService, ctx);
        this.prisma = prisma;
    }
    get delegate() {
        return this.prisma.customerChannel;
    }
    async list(query) {
        const channels = await this.prisma.customerChannel.findMany({
            where: { tenantId: this.ctx.tenantId, typeId: query.typeId, status: query.status },
            orderBy: [{ type: { sortOrder: 'asc' } }, { createdAt: 'asc' }],
            include: { _count: { select: { customers: true } } },
        });
        return channels.map(({ _count, ...c }) => ({ ...c, customerCount: _count.customers }));
    }
    async createChannel(dto) {
        const type = await this.prisma.customerChannelType.findFirst({ where: { id: dto.typeId, tenantId: this.ctx.tenantId } });
        if (!type)
            throw new common_1.BadRequestException('所选渠道类型不存在');
        try {
            return await super.create({ typeId: dto.typeId, name: dto.name.trim(), tenantId: this.ctx.tenantId });
        }
        catch (err) {
            throw this.translateDuplicate(err);
        }
    }
    async updateChannel(id, dto) {
        await this.assertOwn(id);
        const { version, ...data } = dto;
        try {
            return await super.update(id, { ...data, ...(data.name ? { name: data.name.trim() } : {}) }, version);
        }
        catch (err) {
            throw this.translateDuplicate(err);
        }
    }
    async removeChannel(id) {
        await this.assertOwn(id);
        const used = await this.prisma.customer.count({ where: { channelId: id } });
        if (used > 0)
            throw new common_1.ConflictException(`已有 ${used} 位客户选了这个渠道，不能删除；可以改成“停用”`);
        await super.delete(id);
    }
    async assertOwn(id) {
        const found = await this.prisma.customerChannel.findFirst({ where: { id, tenantId: this.ctx.tenantId }, select: { id: true } });
        if (!found)
            throw new common_1.NotFoundException('渠道不存在');
    }
    translateDuplicate(err) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            return new common_1.ConflictException('该渠道类型下已有同名渠道');
        }
        return err;
    }
};
exports.CustomerChannelService = CustomerChannelService;
exports.CustomerChannelService = CustomerChannelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CustomerChannelService);
let CustomerChannelTypeService = class CustomerChannelTypeService extends base_scoped_crud_service_1.BaseScopedCrudService {
    prisma;
    entityType = 'CustomerChannelType';
    constructor(prisma, auditLogService, ctx) {
        super(auditLogService, ctx);
        this.prisma = prisma;
    }
    get delegate() {
        return this.prisma.customerChannelType;
    }
    async list() {
        const types = await this.prisma.customerChannelType.findMany({
            where: { tenantId: this.ctx.tenantId },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            include: { _count: { select: { channels: true, customers: true } } },
        });
        return types.map(({ _count, ...t }) => ({ ...t, channelCount: _count.channels, customerCount: _count.customers }));
    }
    async createType(dto) {
        const max = await this.prisma.customerChannelType.aggregate({ where: { tenantId: this.ctx.tenantId }, _max: { sortOrder: true } });
        try {
            return await super.create({ name: dto.name.trim(), sortOrder: (max._max.sortOrder ?? 0) + 1, tenantId: this.ctx.tenantId });
        }
        catch (err) {
            throw this.translateDuplicate(err);
        }
    }
    async updateType(id, dto) {
        await this.assertOwn(id);
        const { version, ...data } = dto;
        try {
            return await super.update(id, { ...data, ...(data.name ? { name: data.name.trim() } : {}) }, version);
        }
        catch (err) {
            throw this.translateDuplicate(err);
        }
    }
    async removeType(id) {
        const type = await this.assertOwn(id);
        if (type.legacySource)
            throw new common_1.ConflictException('系统内置的渠道类型不能删除，可以改名或停用');
        const [channels, customers] = await Promise.all([
            this.prisma.customerChannel.count({ where: { typeId: id } }),
            this.prisma.customer.count({ where: { channelTypeId: id } }),
        ]);
        if (channels > 0)
            throw new common_1.ConflictException(`该类型下还有 ${channels} 个具体渠道，请先删除或移走它们`);
        if (customers > 0)
            throw new common_1.ConflictException(`已有 ${customers} 位客户选了这个类型，不能删除；可以改成“停用”`);
        await super.delete(id);
    }
    async assertOwn(id) {
        const found = await this.prisma.customerChannelType.findFirst({ where: { id, tenantId: this.ctx.tenantId } });
        if (!found)
            throw new common_1.NotFoundException('渠道类型不存在');
        return found;
    }
    translateDuplicate(err) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            return new common_1.ConflictException('已有同名的渠道类型');
        }
        return err;
    }
};
exports.CustomerChannelTypeService = CustomerChannelTypeService;
exports.CustomerChannelTypeService = CustomerChannelTypeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        request_context_service_1.RequestContextService])
], CustomerChannelTypeService);
//# sourceMappingURL=customer-channel.service.js.map