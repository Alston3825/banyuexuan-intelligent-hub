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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationPublicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../common/decorators/public.decorator");
const api_key_guard_1 = require("./api-key.guard");
const integration_public_service_1 = require("./integration-public.service");
let IntegrationPublicController = class IntegrationPublicController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    ping(req) {
        return { ok: true, system: req.integration.code, serverTime: new Date().toISOString() };
    }
    stores(req, since) {
        return this.svc.stores(req.integration, since);
    }
    rooms(req, storeId, since) {
        return this.svc.rooms(req.integration, storeId, since);
    }
    staff(req, storeId, since) {
        return this.svc.staff(req.integration, storeId, since);
    }
    stays(req, storeId, since, status) {
        return this.svc.stays(req.integration, storeId, since, status);
    }
    serviceCodes(req) {
        return this.svc.serviceCodes(req.integration);
    }
    events(req, storeId, afterSeq) {
        return this.svc.events(req.integration, storeId, afterSeq);
    }
    callEvents(req, body) {
        return this.svc.ingestCall(req.integration, body);
    }
    verify(req, body) {
        return this.svc.verifyAuth(req.integration, body.username, body.password);
    }
};
exports.IntegrationPublicController = IntegrationPublicController;
__decorate([
    (0, common_1.Get)('ping'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationPublicController.prototype, "ping", null);
__decorate([
    (0, common_1.Get)('stores'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('updatedSince')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IntegrationPublicController.prototype, "stores", null);
__decorate([
    (0, common_1.Get)('rooms'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('storeId')),
    __param(2, (0, common_1.Query)('updatedSince')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], IntegrationPublicController.prototype, "rooms", null);
__decorate([
    (0, common_1.Get)('staff'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('storeId')),
    __param(2, (0, common_1.Query)('updatedSince')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], IntegrationPublicController.prototype, "staff", null);
__decorate([
    (0, common_1.Get)('stays'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('storeId')),
    __param(2, (0, common_1.Query)('updatedSince')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], IntegrationPublicController.prototype, "stays", null);
__decorate([
    (0, common_1.Get)('service-codes'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationPublicController.prototype, "serviceCodes", null);
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('storeId')),
    __param(2, (0, common_1.Query)('afterSeq')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], IntegrationPublicController.prototype, "events", null);
__decorate([
    (0, common_1.Post)('call-events'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object]),
    __metadata("design:returntype", void 0)
], IntegrationPublicController.prototype, "callEvents", null);
__decorate([
    (0, common_1.Post)('auth/verify'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], IntegrationPublicController.prototype, "verify", null);
exports.IntegrationPublicController = IntegrationPublicController = __decorate([
    (0, swagger_1.ApiTags)('integration/v1'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.Controller)('integration/v1'),
    __metadata("design:paramtypes", [integration_public_service_1.IntegrationPublicService])
], IntegrationPublicController);
//# sourceMappingURL=integration-public.controller.js.map