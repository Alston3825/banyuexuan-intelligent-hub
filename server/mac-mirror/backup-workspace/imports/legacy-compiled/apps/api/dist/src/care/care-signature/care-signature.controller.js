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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicCareConfirmController = exports.CareSignatureController = exports.MySignatureController = exports.clientIp = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_confirm_public_service_1 = require("./care-confirm-public.service");
const care_signature_service_1 = require("./care-signature.service");
const clientIp = (req) => req.ip;
exports.clientIp = clientIp;
class SetSignatureBody {
    signatureData;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetSignatureBody.prototype, "signatureData", void 0);
class SignBody {
    motherProfileId;
    date;
    shift;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SignBody.prototype, "motherProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SignBody.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['DAY', 'NIGHT', 'RELIEF'] }),
    (0, class_validator_1.IsEnum)(client_1.CareSignShift),
    __metadata("design:type", typeof (_a = typeof client_1.CareSignShift !== "undefined" && client_1.CareSignShift) === "function" ? _a : Object)
], SignBody.prototype, "shift", void 0);
class LinkBody {
    motherProfileId;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LinkBody.prototype, "motherProfileId", void 0);
class VerifyBody {
    phoneLast4;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyBody.prototype, "phoneLast4", void 0);
class ConfirmBody {
    viewToken;
    items;
    method;
    signatureData;
    holdMs;
    deviceId;
    acknowledged;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmBody.prototype, "viewToken", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ConfirmBody.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.CareConfirmMethod),
    __metadata("design:type", typeof (_b = typeof client_1.CareConfirmMethod !== "undefined" && client_1.CareConfirmMethod) === "function" ? _b : Object)
], ConfirmBody.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmBody.prototype, "signatureData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ConfirmBody.prototype, "holdMs", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmBody.prototype, "deviceId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ConfirmBody.prototype, "acknowledged", void 0);
let MySignatureController = class MySignatureController {
    service;
    constructor(service) {
        this.service = service;
    }
    get() {
        return this.service.mySignature();
    }
    set(dto) {
        return this.service.setMySignature(dto.signatureData);
    }
};
exports.MySignatureController = MySignatureController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MySignatureController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SetSignatureBody]),
    __metadata("design:returntype", void 0)
], MySignatureController.prototype, "set", null);
exports.MySignatureController = MySignatureController = __decorate([
    (0, swagger_1.ApiTags)('me'),
    (0, common_1.Controller)('me/signature'),
    __metadata("design:paramtypes", [care_signature_service_1.CareSignatureService])
], MySignatureController);
let CareSignatureController = class CareSignatureController {
    service;
    constructor(service) {
        this.service = service;
    }
    overview(motherProfileId) {
        return this.service.overview(motherProfileId);
    }
    status(motherProfileId, date) {
        return this.service.dayStatus(motherProfileId, date);
    }
    sign(dto, deviceId) {
        return this.service.sign({ ...dto, deviceId });
    }
    unsign(id) {
        return this.service.unsign(id);
    }
    createLink(dto) {
        return this.service.createLink(dto.motherProfileId);
    }
    links(motherProfileId) {
        return this.service.listLinks(motherProfileId);
    }
    revoke(id) {
        return this.service.revokeLink(id);
    }
};
exports.CareSignatureController = CareSignatureController;
__decorate([
    (0, common_1.Get)('sign-overview'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)('motherProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareSignatureController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('signatures'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)('motherProfileId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CareSignatureController.prototype, "status", null);
__decorate([
    (0, common_1.Post)('signatures'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-device-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SignBody, String]),
    __metadata("design:returntype", void 0)
], CareSignatureController.prototype, "sign", null);
__decorate([
    (0, common_1.Delete)('signatures/:id'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareSignatureController.prototype, "unsign", null);
__decorate([
    (0, common_1.Post)('confirm-links'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LinkBody]),
    __metadata("design:returntype", void 0)
], CareSignatureController.prototype, "createLink", null);
__decorate([
    (0, common_1.Get)('confirm-links'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)('motherProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareSignatureController.prototype, "links", null);
__decorate([
    (0, common_1.Delete)('confirm-links/:id'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareSignatureController.prototype, "revoke", null);
exports.CareSignatureController = CareSignatureController = __decorate([
    (0, swagger_1.ApiTags)('care/signature'),
    (0, common_1.Controller)('care/daily'),
    __metadata("design:paramtypes", [care_signature_service_1.CareSignatureService])
], CareSignatureController);
let PublicCareConfirmController = class PublicCareConfirmController {
    service;
    constructor(service) {
        this.service = service;
    }
    info(token) {
        return this.service.info(token);
    }
    verify(token, dto) {
        return this.service.verify(token, dto.phoneLast4);
    }
    days(token, session) {
        return this.service.days(token, session);
    }
    confirm(token, dto, req, session) {
        return this.service.confirm(token, session, dto, { ip: (0, exports.clientIp)(req), userAgent: req.headers['user-agent'] });
    }
};
exports.PublicCareConfirmController = PublicCareConfirmController;
__decorate([
    (0, common_1.Get)(':token/info'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicCareConfirmController.prototype, "info", null);
__decorate([
    (0, common_1.Post)(':token/verify'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, VerifyBody]),
    __metadata("design:returntype", void 0)
], PublicCareConfirmController.prototype, "verify", null);
__decorate([
    (0, common_1.Get)(':token/days'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Headers)('x-confirm-session')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicCareConfirmController.prototype, "days", null);
__decorate([
    (0, common_1.Post)(':token/confirm'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Headers)('x-confirm-session')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ConfirmBody, Object, String]),
    __metadata("design:returntype", void 0)
], PublicCareConfirmController.prototype, "confirm", null);
exports.PublicCareConfirmController = PublicCareConfirmController = __decorate([
    (0, swagger_1.ApiTags)('public/care-confirm'),
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('public/care-confirm'),
    __metadata("design:paramtypes", [care_confirm_public_service_1.CareConfirmPublicService])
], PublicCareConfirmController);
//# sourceMappingURL=care-signature.controller.js.map