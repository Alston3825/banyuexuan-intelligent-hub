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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../prisma/prisma.service");
const password_service_1 = require("./password.service");
const audit_log_service_1 = require("../audit/audit-log.service");
const permission_lookup_service_1 = require("../common/context/permission-lookup.service");
const employee_no_util_1 = require("../common/utils/employee-no.util");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    passwordService;
    auditLogService;
    permissionLookupService;
    constructor(prisma, jwtService, configService, passwordService, auditLogService, permissionLookupService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.passwordService = passwordService;
        this.auditLogService = auditLogService;
        this.permissionLookupService = permissionLookupService;
    }
    async login(username, password, meta) {
        const key = username.trim();
        let account = await this.prisma.account.findFirst({ where: { username: key } });
        if (!account) {
            const phone = (0, employee_no_util_1.normalizeMobile)(key);
            if (phone)
                account = await this.prisma.account.findFirst({ where: { phone } });
        }
        if (!account || account.status !== 'ACTIVE') {
            await this.auditLogService.record({
                action: 'LOGIN_FAILED',
                entityType: 'Account',
                remark: `username=${key}`,
                result: 'FAILURE',
                ip: meta.ip,
                userAgent: meta.userAgent,
            });
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        const passwordOk = await this.passwordService.compare(password, account.passwordHash);
        if (!passwordOk) {
            await this.auditLogService.record({
                action: 'LOGIN_FAILED',
                entityType: 'Account',
                entityId: account.id,
                tenantId: account.tenantId,
                accountId: account.id,
                result: 'FAILURE',
                ip: meta.ip,
                userAgent: meta.userAgent,
            });
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        const accessToken = this.signAccessToken(account);
        const refreshToken = await this.issueRefreshToken(account.id, meta);
        await this.touchDevice(account.id, meta);
        await this.prisma.account.update({ where: { id: account.id }, data: { lastLoginAt: new Date() } });
        await this.auditLogService.record({
            action: 'LOGIN',
            entityType: 'Account',
            entityId: account.id,
            tenantId: account.tenantId,
            storeId: account.storeId,
            accountId: account.id,
            ip: meta.ip,
            userAgent: meta.userAgent,
        });
        const permissions = Array.from(await this.permissionLookupService.getPermissionCodes(account.id)).sort();
        return {
            accessToken,
            refreshToken,
            account: { id: account.id, username: account.username, realName: account.realName, uiTheme: account.uiTheme ?? null },
            permissions,
        };
    }
    async refresh(rawRefreshToken, meta) {
        const tokenHash = this.hashToken(rawRefreshToken);
        const record = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { account: true },
        });
        if (!record || record.revokedAt || record.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('刷新令牌无效或已过期');
        }
        await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
        const accessToken = this.signAccessToken(record.account);
        const newRefreshToken = await this.issueRefreshToken(record.accountId, meta);
        await this.touchDevice(record.accountId, meta);
        const permissions = Array.from(await this.permissionLookupService.getPermissionCodes(record.accountId)).sort();
        return { accessToken, refreshToken: newRefreshToken, permissions };
    }
    async logout(rawRefreshToken) {
        const tokenHash = this.hashToken(rawRefreshToken);
        await this.prisma.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    async touchDevice(accountId, meta) {
        const deviceId = meta.deviceId;
        if (!deviceId || !/^[A-Za-z0-9_-]{16,64}$/.test(deviceId))
            return;
        try {
            await this.prisma.staffDevice.upsert({
                where: { accountId_deviceId: { accountId, deviceId } },
                update: { lastSeenAt: new Date(), lastIp: meta.ip ?? null },
                create: { accountId, deviceId, lastIp: meta.ip ?? null },
            });
        }
        catch {
        }
    }
    signAccessToken(account) {
        return this.jwtService.sign({ sub: account.id, tenantId: account.tenantId, storeId: account.storeId }, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: (this.configService.get('JWT_ACCESS_TTL') ?? '30m'),
        });
    }
    async issueRefreshToken(accountId, meta) {
        const raw = crypto.randomBytes(48).toString('hex');
        const tokenHash = this.hashToken(raw);
        const ttlDays = Number(this.configService.get('JWT_REFRESH_TTL_DAYS') ?? 14);
        const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: { accountId, tokenHash, expiresAt, ip: meta.ip, userAgent: meta.userAgent?.slice(0, 190) },
        });
        return raw;
    }
    hashToken(raw) {
        return crypto.createHash('sha256').update(raw).digest('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object, password_service_1.PasswordService,
        audit_log_service_1.AuditLogService,
        permission_lookup_service_1.PermissionLookupService])
], AuthService);
//# sourceMappingURL=auth.service.js.map