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
exports.FieldMaskInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const mask_entity_decorator_1 = require("../decorators/mask-entity.decorator");
const permission_lookup_service_1 = require("../context/permission-lookup.service");
const sensitive_field_registry_1 = require("../masking/sensitive-field-registry");
let FieldMaskInterceptor = class FieldMaskInterceptor {
    reflector;
    permissionLookup;
    constructor(reflector, permissionLookup) {
        this.reflector = reflector;
        this.permissionLookup = permissionLookup;
    }
    intercept(context, next) {
        const entityType = this.reflector.getAllAndOverride(mask_entity_decorator_1.MASK_ENTITY_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!entityType || !sensitive_field_registry_1.SENSITIVE_FIELD_REGISTRY[entityType]) {
            return next.handle();
        }
        const rules = sensitive_field_registry_1.SENSITIVE_FIELD_REGISTRY[entityType];
        const request = context.switchToHttp().getRequest();
        const accountId = request.user?.accountId;
        return next.handle().pipe((0, rxjs_1.switchMap)((result) => (0, rxjs_1.from)(this.permissionLookup.getPermissionCodes(accountId)).pipe((0, rxjs_1.map)((permissionCodes) => this.maskResult(result, rules, permissionCodes)))));
    }
    maskResult(result, rules, permissionCodes) {
        const applicableRules = rules.filter((r) => !permissionCodes.has(r.permissionCode));
        if (applicableRules.length === 0)
            return result;
        const maskOne = (item) => {
            if (!item || typeof item !== 'object')
                return item;
            const clone = { ...item };
            for (const rule of applicableRules) {
                if (rule.field in clone) {
                    clone[rule.field] = rule.mask(clone[rule.field]);
                }
            }
            return clone;
        };
        if (Array.isArray(result))
            return result.map(maskOne);
        if (result && typeof result === 'object' && Array.isArray(result.data)) {
            return { ...result, data: result.data.map(maskOne) };
        }
        return maskOne(result);
    }
};
exports.FieldMaskInterceptor = FieldMaskInterceptor;
exports.FieldMaskInterceptor = FieldMaskInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object, permission_lookup_service_1.PermissionLookupService])
], FieldMaskInterceptor);
//# sourceMappingURL=field-mask.interceptor.js.map