import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, ip: string, userAgent: string, deviceId?: string): unknown;
    refresh(dto: RefreshTokenDto, ip: string, userAgent: string, deviceId?: string): unknown;
    logout(dto: RefreshTokenDto): Promise<void>;
}
