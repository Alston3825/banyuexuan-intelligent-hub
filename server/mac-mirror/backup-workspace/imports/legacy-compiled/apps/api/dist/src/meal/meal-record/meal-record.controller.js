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
exports.MealRecordController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const meal_record_service_1 = require("./meal-record.service");
const query_meal_record_dto_1 = require("./dto/query-meal-record.dto");
const select_meal_record_dto_1 = require("./dto/select-meal-record.dto");
const feedback_meal_record_dto_1 = require("./dto/feedback-meal-record.dto");
const query_meal_report_dto_1 = require("./dto/query-meal-report.dto");
let MealRecordController = class MealRecordController {
    mealRecordService;
    constructor(mealRecordService) {
        this.mealRecordService = mealRecordService;
    }
    findAll(query) {
        return this.mealRecordService.findMany(query);
    }
    report(query) {
        return this.mealRecordService.report(query);
    }
    findOne(id) {
        return this.mealRecordService.findOneOrThrow(id);
    }
    select(id, dto) {
        return this.mealRecordService.select(id, dto);
    }
    serve(id) {
        return this.mealRecordService.serve(id);
    }
    feedback(id, dto) {
        return this.mealRecordService.feedback(id, dto);
    }
};
exports.MealRecordController = MealRecordController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('meal.record.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_meal_record_dto_1.QueryMealRecordDto]),
    __metadata("design:returntype", void 0)
], MealRecordController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('report'),
    (0, require_permission_decorator_1.RequirePermission)('meal.record.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_meal_report_dto_1.QueryMealReportDto]),
    __metadata("design:returntype", void 0)
], MealRecordController.prototype, "report", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('meal.record.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MealRecordController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/select'),
    (0, require_permission_decorator_1.RequirePermission)('meal.record.select'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, select_meal_record_dto_1.SelectMealRecordDto]),
    __metadata("design:returntype", void 0)
], MealRecordController.prototype, "select", null);
__decorate([
    (0, common_1.Post)(':id/serve'),
    (0, require_permission_decorator_1.RequirePermission)('meal.record.serve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MealRecordController.prototype, "serve", null);
__decorate([
    (0, common_1.Post)(':id/feedback'),
    (0, require_permission_decorator_1.RequirePermission)('meal.record.feedback'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, feedback_meal_record_dto_1.FeedbackMealRecordDto]),
    __metadata("design:returntype", void 0)
], MealRecordController.prototype, "feedback", null);
exports.MealRecordController = MealRecordController = __decorate([
    (0, swagger_1.ApiTags)('meal/record'),
    (0, common_1.Controller)('meal/records'),
    __metadata("design:paramtypes", [meal_record_service_1.MealRecordService])
], MealRecordController);
//# sourceMappingURL=meal-record.controller.js.map