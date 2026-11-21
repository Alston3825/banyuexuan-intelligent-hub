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
exports.CareRecordController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_record_service_1 = require("./care-record.service");
const create_care_record_dto_1 = require("./dto/create-care-record.dto");
const query_care_record_dto_1 = require("./dto/query-care-record.dto");
let CareRecordController = class CareRecordController {
    careRecordService;
    constructor(careRecordService) {
        this.careRecordService = careRecordService;
    }
    findAll(query) {
        return this.careRecordService.findMany(query);
    }
    findOne(id) {
        return this.careRecordService.findOneOrThrow(id);
    }
    create(dto) {
        return this.careRecordService.create(dto);
    }
};
exports.CareRecordController = CareRecordController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('care.record.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_care_record_dto_1.QueryCareRecordDto]),
    __metadata("design:returntype", void 0)
], CareRecordController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('care.record.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareRecordController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('care.record.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_care_record_dto_1.CreateCareRecordDto]),
    __metadata("design:returntype", void 0)
], CareRecordController.prototype, "create", null);
exports.CareRecordController = CareRecordController = __decorate([
    (0, swagger_1.ApiTags)('care/record'),
    (0, common_1.Controller)('care/records'),
    __metadata("design:paramtypes", [care_record_service_1.CareRecordService])
], CareRecordController);
//# sourceMappingURL=care-record.controller.js.map