"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationAdminService = exports.DEFAULT_SERVICE_CODES = void 0;
exports.ensureServiceCodes = ensureServiceCodes;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../prisma/prisma.service");
const request_context_service_1 = require("../common/context/request-context.service");
const api_key_guard_1 = require("./api-key.guard");
exports.DEFAULT_SERVICE_CODES = [
    { serviceCode: 'NEED_NURSE', name: '呼叫护理师', category: 'CALL', sortNo: 1 },
    { serviceCode: 'BABY_CRY', name: '宝宝哭闹', category: 'CALL', sortNo: 2 },
    { serviceCode: 'MILK_STORAGE', name: '母乳存放', category: 'CALL', sortNo: 3 },
    { serviceCode: 'HOT_WATER', name: '送热水', category: 'CALL', sortNo: 4 },
    { serviceCode: 'CLEANING', name: '保洁', category: 'CALL', sortNo: 5 },
    { serviceCode: 'EMERGENCY', name: '紧急呼叫', category: 'CALL', sortNo: 6 },
    { serviceCode: 'CUSTOM', name: '其他需求', category: 'CALL', sortNo: 7 },
];
let IntegrationAdminService = class IntegrationAdminService {
    prisma;
    ctx;
    constructor(prisma, ctx) {
        this.prisma = prisma;
        this.ctx = ctx;
    }
    get tenantId() {
        const t = this.ctx.tenantId;
        if (!t)
            throw new common_1.UnauthorizedException('未登录');
        return t;
    }
    listSystems() {
        return this.prisma.integrationSystem.findMany({
            where: { tenantId: this.tenantId },
            orderBy: { createdAt: 'desc' },
            select: { id: true, code: true, name: true, baseUrl: true, systemVersion: true, storeId: true, apiKeyPrefix: true, enabled: true, lastSeenAt: true, remark: true, createdAt: true, version: true },
        });
    }
    newKey() {
        const key = `bmx_${crypto.randomBytes(24).toString('hex')}`;
        return { key, apiKeyHash: (0, api_key_guard_1.hashApiKey)(key), apiKeyPrefix: key.slice(0, 10) };
    }
    async createSystem(dto) {
        const code = dto.code.trim();
        if (!/^[a-z0-9][a-z0-9-_]{1,62}$/.test(code))
            throw new common_1.BadRequestException('系统代号只能用小写字母、数字、-、_（如 call-locating）');
        const exists = await this.prisma.integrationSystem.findFirst({ where: { tenantId: this.tenantId, code } });
        if (exists)
            throw new common_1.ConflictException('该系统代号已存在');
        const { key, apiKeyHash, apiKeyPrefix } = this.newKey();
        const row = await this.prisma.integrationSystem.create({
            data: { tenantId: this.tenantId, code, name: dto.name.trim(), baseUrl: dto.baseUrl || null, systemVersion: dto.systemVersion || null, storeId: dto.storeId || null, remark: dto.remark || null, apiKeyHash, apiKeyPrefix, createdBy: this.ctx.accountId },
        });
        return { id: row.id, code: row.code, apiKey: key };
    }
    async updateSystem(id, dto) {
        const row = await this.prisma.integrationSystem.findFirst({ where: { id, tenantId: this.tenantId } });
        if (!row)
            throw new common_1.NotFoundException('接入系统不存在');
        return this.prisma.integrationSystem.update({ where: { id }, data: { ...dto, version: { increment: 1 } } });
    }
    async resetKey(id) {
        const row = await this.prisma.integrationSystem.findFirst({ where: { id, tenantId: this.tenantId } });
        if (!row)
            throw new common_1.NotFoundException('接入系统不存在');
        const { key, apiKeyHash, apiKeyPrefix } = this.newKey();
        await this.prisma.integrationSystem.update({ where: { id }, data: { apiKeyHash, apiKeyPrefix, version: { increment: 1 } } });
        return { id, apiKey: key };
    }
    listBindings(storeId, roomId) {
        return this.prisma.roomDeviceBinding.findMany({
            where: { tenantId: this.tenantId, ...(storeId ? { storeId } : {}), ...(roomId ? { roomId } : {}) },
            include: { room: { select: { roomNo: true, floor: true } } },
            orderBy: [{ roomId: 'asc' }, { kind: 'asc' }, { deviceCode: 'asc' }],
        });
    }
    async addBinding(dto) {
        const room = await this.prisma.room.findFirst({ where: { id: dto.roomId, tenantId: this.tenantId } });
        if (!room)
            throw new common_1.NotFoundException('房间不存在');
        const deviceCode = dto.deviceCode.trim();
        if (!deviceCode)
            throw new common_1.BadRequestException('设备编号不能为空');
        if (dto.kind === 'BEACON' && !/^\d+-\d+$/.test(deviceCode)) {
            throw new common_1.BadRequestException('信标编号格式必须是「大号-小号」，例如 1601-1（只含数字和中间一个短横线）');
        }
        const dup = await this.prisma.roomDeviceBinding.findFirst({ where: { tenantId: this.tenantId, storeId: room.storeId, kind: dto.kind, deviceCode }, include: { room: true } });
        if (dup)
            throw new common_1.ConflictException(`该设备编号已绑定在 ${dup.room.roomNo} 房`);
        if (dto.kind === 'TABLET') {
            const has = await this.prisma.roomDeviceBinding.findFirst({ where: { tenantId: this.tenantId, roomId: room.id, kind: 'TABLET' } });
            if (has)
                throw new common_1.ConflictException('这间房已绑定了一台平板，请先解绑再换');
        }
        return this.prisma.roomDeviceBinding.create({ data: { tenantId: this.tenantId, storeId: room.storeId, roomId: room.id, kind: dto.kind, deviceCode, remark: dto.remark || null, createdBy: this.ctx.accountId } });
    }
    async removeBinding(id) {
        const row = await this.prisma.roomDeviceBinding.findFirst({ where: { id, tenantId: this.tenantId } });
        if (!row)
            throw new common_1.NotFoundException('绑定不存在');
        await this.prisma.$transaction([
            this.prisma.roomDeviceBinding.delete({ where: { id } }),
            this.prisma.room.update({ where: { id: row.roomId }, data: { updatedAt: new Date() } }),
        ]);
        return { ok: true };
    }
    async listServiceCodes() {
        const tenantId = this.tenantId;
        await ensureServiceCodes(this.prisma, tenantId);
        return this.prisma.serviceCatalogItem.findMany({ where: { tenantId }, orderBy: { sortNo: 'asc' } });
    }
    async upsertServiceCode(dto) {
        const serviceCode = dto.serviceCode.trim().toUpperCase();
        if (!/^[A-Z0-9_]{2,64}$/.test(serviceCode))
            throw new common_1.BadRequestException('服务代号只能用大写字母、数字、下划线');
        return this.prisma.serviceCatalogItem.upsert({
            where: { tenantId_serviceCode: { tenantId: this.tenantId, serviceCode } },
            create: { tenantId: this.tenantId, serviceCode, name: dto.name, category: dto.category ?? 'CALL', sortNo: dto.sortNo ?? 99, status: dto.status ?? 'ACTIVE' },
            update: { name: dto.name, ...(dto.category ? { category: dto.category } : {}), ...(dto.sortNo != null ? { sortNo: dto.sortNo } : {}), ...(dto.status ? { status: dto.status } : {}) },
        });
    }
    listCalls(q) {
        return this.prisma.externalCallRecord.findMany({
            where: {
                tenantId: this.tenantId,
                ...(q.storeId ? { storeId: q.storeId } : {}),
                ...(q.roomId ? { roomId: q.roomId } : {}),
                ...(q.stayId ? { stayId: q.stayId } : {}),
                ...(q.from || q.to ? { initiatedAt: { ...(q.from ? { gte: new Date(q.from) } : {}), ...(q.to ? { lte: new Date(q.to) } : {}) } } : {}),
            },
            orderBy: { initiatedAt: 'desc' },
            take: Math.min(q.take ?? 100, 500),
        });
    }
};
exports.IntegrationAdminService = IntegrationAdminService;
exports.IntegrationAdminService = IntegrationAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, request_context_service_1.RequestContextService])
], IntegrationAdminService);
async function ensureServiceCodes(prisma, tenantId) {
    const n = await prisma.serviceCatalogItem.count({ where: { tenantId } });
    if (n > 0)
        return;
    await prisma.serviceCatalogItem.createMany({ data: exports.DEFAULT_SERVICE_CODES.map((d) => ({ ...d, tenantId })), skipDuplicates: true });
}
//# sourceMappingURL=integration-admin.service.js.map