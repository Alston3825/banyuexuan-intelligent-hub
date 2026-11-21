import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import { AuditLogService } from '../audit/audit-log.service';
import { PermissionLookupService } from '../common/context/permission-lookup.service';
interface RequestMeta {
    ip?: string;
    userAgent?: string;
    deviceId?: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly passwordService;
    private readonly auditLogService;
    private readonly permissionLookupService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, passwordService: PasswordService, auditLogService: AuditLogService, permissionLookupService: PermissionLookupService);
    login(username: string, password: string, meta: RequestMeta): unknown;
    refresh(rawRefreshToken: string, meta: RequestMeta): unknown;
    logout(rawRefreshToken: string): Promise<void>;
    private touchDevice;
    private signAccessToken;
    private issueRefreshToken;
    private hashToken;
}
export {};
