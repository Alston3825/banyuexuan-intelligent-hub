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
exports.TherapistController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const therapist_service_1 = require("./therapist.service");
const create_therapist_dto_1 = require("./dto/create-therapist.dto");
const update_therapist_dto_1 = require("./dto/update-therapist.dto");
const query_therapist_dto_1 = require("./dto/query-therapist.dto");
let TherapistController = class TherapistController {
    therapistService;
    constructor(therapistService) {
        this.therapistService = therapistService;
    }
    findAll(query) {
        return this.therapistService.findMany(query);
    }
    findOne(id) {
        return this.therapistService.findOneOrThrow(id);
    }
    create(dto) {
        return this.therapistService.create(dto);
    }
    update(id, dto) {
        const { version, ...data } = dto;
        return this.therapistService.update(id, data, version);
    }
};
exports.TherapistController = TherapistController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('service.therapist.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_therapist_dto_1.QueryTherapistDto]),
    __metadata("design:returntype", void 0)
], TherapistController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('service.therapist.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TherapistController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('service.therapist.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_therapist_dto_1.CreateTherapistDto]),
    __metadata("design:returntype", void 0)
], TherapistController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('service.therapist.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_therapist_dto_1.UpdateTherapistDto]),
    __metadata("design:returntype", void 0)
], TherapistController.prototype, "update", null);
exports.TherapistController = TherapistController = __decorate([
    (0, swagger_1.ApiTags)('service/therapist'),
    (0, common_1.Controller)('service/therapists'),
    __metadata("design:paramtypes", [therapist_service_1.TherapistService])
], TherapistController);
//# sourceMappingURL=therapist.controller.js.map