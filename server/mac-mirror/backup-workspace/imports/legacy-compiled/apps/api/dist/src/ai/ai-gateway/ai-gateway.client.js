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
exports.AiGatewayClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AiGatewayClient = class AiGatewayClient {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async complete(messages) {
        const data = await this.post('/chat/complete', {
            messages,
        });
        return { content: data.content, provider: data.provider, model: data.model, latencyMs: data.latency_ms, usedFallback: data.used_fallback };
    }
    async embed(texts) {
        const data = await this.post('/embeddings/create', { texts });
        return { embeddings: data.embeddings, provider: data.provider, model: data.model, latencyMs: data.latency_ms, usedFallback: data.used_fallback };
    }
    async extractContract(files) {
        return this.post('/contract/extract', { files: files.map((f) => ({ name: f.name, data_b64: f.data.toString('base64') })) }, 5 * 60 * 1000);
    }
    async extractCareForm(spec, files) {
        return this.post('/care-form/extract', {
            form_title: spec.formTitle,
            description: spec.description,
            fields: spec.fields,
            files: files.map((f) => ({ name: f.name, data_b64: f.data.toString('base64') })),
        }, 5 * 60 * 1000);
    }
    async normalizeImage(data) {
        const res = await this.post('/care-form/normalize', { data_b64: data.toString('base64') }, 60_000);
        return Buffer.from(res.jpeg_b64, 'base64');
    }
    async post(path, body, timeoutMs = 60_000) {
        const baseUrl = this.configService.get('AI_GATEWAY_BASE_URL') ?? 'http://localhost:8000';
        const apiKey = this.configService.get('AI_GATEWAY_INTERNAL_API_KEY') ?? '';
        let res;
        try {
            res = await fetch(`${baseUrl}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Internal-Api-Key': apiKey },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(timeoutMs),
            });
        }
        catch (err) {
            throw new common_1.ServiceUnavailableException(`AI 模型网关调用失败：${err.message}`);
        }
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new common_1.ServiceUnavailableException(`AI 模型网关返回错误(${res.status})：${text}`);
        }
        return (await res.json());
    }
};
exports.AiGatewayClient = AiGatewayClient;
exports.AiGatewayClient = AiGatewayClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], AiGatewayClient);
//# sourceMappingURL=ai-gateway.client.js.map