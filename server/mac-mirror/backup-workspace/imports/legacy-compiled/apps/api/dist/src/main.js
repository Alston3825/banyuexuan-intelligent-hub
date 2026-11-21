"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const isProduction = process.env.NODE_ENV === 'production';
    const hops = Number(process.env.TRUST_PROXY_HOPS ?? (isProduction ? 2 : 0));
    if (hops > 0)
        app.getHttpAdapter().getInstance().set('trust proxy', hops);
    app.use((0, helmet_1.default)());
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    if (allowedOrigins.length > 0) {
        app.enableCors({ origin: allowedOrigins, credentials: true });
    }
    if (!isProduction) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('伴月轩月子中心管理系统 API')
            .setDescription('P0 平台底座：多门店组织账号体系 / RBAC / 工作流引擎骨架')
            .setVersion('0.1.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/v1/docs', app, document);
    }
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map