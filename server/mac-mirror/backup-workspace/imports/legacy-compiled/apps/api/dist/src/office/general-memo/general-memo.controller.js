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
exports.GeneralMemoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const general_memo_service_1 = require("./general-memo.service");
const create_general_memo_dto_1 = require("./dto/create-general-memo.dto");
const query_general_memo_dto_1 = require("./dto/query-general-memo.dto");
const cancel_general_memo_dto_1 = require("./dto/cancel-general-memo.dto");
const version_dto_1 = require("./dto/version.dto");
let GeneralMemoController = class GeneralMemoController {
    generalMemoService;
    constructor(generalMemoService) {
        this.generalMemoService = generalMemoService;
    }
    findAll(query) {
        return this.generalMemoService.findMany(query);
    }
    findOne(id) {
        return this.generalMemoService.findOneOrThrow(id);
    }
    create(dto) {
        return this.generalMemoService.create(dto);
    }
    submit(id, dto) {
        return this.generalMemoService.submit(id, dto.version);
    }
    cancel(id, dto) {
        return this.generalMemoService.cancel(id, dto.cancelReason, dto.version);
    }
};
exports.GeneralMemoController = GeneralMemoController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('office.general-memo.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_general_memo_dto_1.QueryGeneralMemoDto]),
    __metadata("design:returntype", void 0)
], GeneralMemoController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('office.general-memo.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GeneralMemoController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('office.general-memo.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_general_memo_dto_1.CreateGeneralMemoDto]),
    __metadata("design:returntype", void 0)
], GeneralMemoController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, require_permission_decorator_1.RequirePermission)('office.general-memo.submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], GeneralMemoController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('office.general-memo.cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_general_memo_dto_1.CancelGeneralMemoDto]),
    __metadata("design:returntype", void 0)
], GeneralMemoController.prototype, "cancel", null);
exports.GeneralMemoController = GeneralMemoController = __decorate([
    (0, swagger_1.ApiTags)('office/general-memo'),
    (0, common_1.Controller)('office/general-memos'),
    __metadata("design:paramtypes", [general_memo_service_1.GeneralMemoService])
], GeneralMemoController);
//# sourceMappingURL=general-memo.controller.js.map