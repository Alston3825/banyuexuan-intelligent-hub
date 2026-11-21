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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContextService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const permission_lookup_service_1 = require("./permission-lookup.service");
let RequestContextService = class RequestContextService {
    request;
    permissionLookup;
    permissionCodes = null;
    scopeGrants = null;
    constructor(request, permissionLookup) {
        this.request = request;
        this.permissionLookup = permissionLookup;
    }
    get accountId() {
        return this.request.user?.accountId;
    }
    get tenantId() {
        return this.request.user?.tenantId;
    }
    get homeStoreId() {
        return this.request.user?.storeId;
    }
    get ip() {
        return this.request.ip;
    }
    get userAgent() {
        return this.request.headers['user-agent'];
    }
    get requestId() {
        return this.request.requestId;
    }
    async ensureLoaded() {
        if (this.permissionCodes && this.scopeGrants)
            return;
        this.permissionCodes = await this.permissionLookup.getPermissionCodes(this.accountId);
        this.scopeGrants = await this.permissionLookup.getScopeGrants(this.accountId);
    }
    async getPermissionCodes() {
        await this.ensureLoaded();
        return this.permissionCodes;
    }
    async hasPermission(code) {
        const codes = await this.getPermissionCodes();
        return codes.has(code);
    }
    async getScopeGrants() {
        await this.ensureLoaded();
        return this.scopeGrants;
    }
};
exports.RequestContextService = RequestContextService;
exports.RequestContextService = RequestContextService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [Object, permission_lookup_service_1.PermissionLookupService])
], RequestContextService);
//# sourceMappingURL=request-context.service.js.map