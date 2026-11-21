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
exports.CareDailyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const care_daily_service_1 = require("./care-daily.service");
class SaveDayBody {
    motherProfileId;
    date;
    documentId;
    version;
    mother;
    babies;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SaveDayBody.prototype, "motherProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'YYYY-MM-DD' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SaveDayBody.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], SaveDayBody.prototype, "documentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '当天记录已存在时必填（乐观锁）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SaveDayBody.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '妈妈栏字段值' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], SaveDayBody.prototype, "mother", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '每个宝宝的栏：babyProfileId + values + feedings[]' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SaveDayBody.prototype, "babies", void 0);
let CareDailyController = class CareDailyController {
    service;
    constructor(service) {
        this.service = service;
    }
    specs() {
        return this.service.specs();
    }
    days(motherProfileId) {
        return this.service.days(motherProfileId);
    }
    pending(storeId, date) {
        return this.service.pending(storeId, date);
    }
    day(motherProfileId, date) {
        return this.service.day(motherProfileId, date);
    }
    save(dto) {
        return this.service.saveDay(dto);
    }
};
exports.CareDailyController = CareDailyController;
__decorate([
    (0, common_1.Get)('specs'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CareDailyController.prototype, "specs", null);
__decorate([
    (0, common_1.Get)('days'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)('motherProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CareDailyController.prototype, "days", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)('storeId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CareDailyController.prototype, "pending", null);
__decorate([
    (0, common_1.Get)('day'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.view'),
    __param(0, (0, common_1.Query)('motherProfileId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CareDailyController.prototype, "day", null);
__decorate([
    (0, common_1.Put)('day'),
    (0, require_permission_decorator_1.RequirePermission)('care.profile.update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SaveDayBody]),
    __metadata("design:returntype", void 0)
], CareDailyController.prototype, "save", null);
exports.CareDailyController = CareDailyController = __decorate([
    (0, swagger_1.ApiTags)('care/daily'),
    (0, common_1.Controller)('care/daily'),
    __metadata("design:paramtypes", [care_daily_service_1.CareDailyService])
], CareDailyController);
//# sourceMappingURL=care-daily.controller.js.map