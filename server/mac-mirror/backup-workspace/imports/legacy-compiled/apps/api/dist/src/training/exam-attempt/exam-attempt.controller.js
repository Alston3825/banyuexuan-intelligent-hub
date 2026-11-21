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
exports.ExamAttemptController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const exam_attempt_service_1 = require("./exam-attempt.service");
const submit_exam_attempt_dto_1 = require("./dto/submit-exam-attempt.dto");
const grade_exam_attempt_dto_1 = require("./dto/grade-exam-attempt.dto");
let ExamAttemptController = class ExamAttemptController {
    examAttemptService;
    constructor(examAttemptService) {
        this.examAttemptService = examAttemptService;
    }
    listAvailableExams() {
        return this.examAttemptService.listAvailableExams();
    }
    getExamForAttempt(id) {
        return this.examAttemptService.getExamForAttemptOrThrow(id);
    }
    findMine() {
        return this.examAttemptService.findMyAttempts();
    }
    findPendingGrading() {
        return this.examAttemptService.findPendingGrading();
    }
    submit(dto) {
        return this.examAttemptService.submit(dto);
    }
    findOne(id) {
        return this.examAttemptService.findOneAttemptOrThrow(id);
    }
    grade(id, dto) {
        return this.examAttemptService.grade(id, dto);
    }
};
exports.ExamAttemptController = ExamAttemptController;
__decorate([
    (0, common_1.Get)('available-exams'),
    (0, require_permission_decorator_1.RequirePermission)('training.exam-attempt.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExamAttemptController.prototype, "listAvailableExams", null);
__decorate([
    (0, common_1.Get)('exams/:id'),
    (0, require_permission_decorator_1.RequirePermission)('training.exam-attempt.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExamAttemptController.prototype, "getExamForAttempt", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, require_permission_decorator_1.RequirePermission)('training.exam-attempt.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExamAttemptController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('pending-grading'),
    (0, require_permission_decorator_1.RequirePermission)('training.exam-attempt.grade'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExamAttemptController.prototype, "findPendingGrading", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('training.exam-attempt.submit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_exam_attempt_dto_1.SubmitExamAttemptDto]),
    __metadata("design:returntype", void 0)
], ExamAttemptController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('training.exam-attempt.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExamAttemptController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/grade'),
    (0, require_permission_decorator_1.RequirePermission)('training.exam-attempt.grade'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, grade_exam_attempt_dto_1.GradeExamAttemptDto]),
    __metadata("design:returntype", void 0)
], ExamAttemptController.prototype, "grade", null);
exports.ExamAttemptController = ExamAttemptController = __decorate([
    (0, swagger_1.ApiTags)('training/exam-attempt'),
    (0, common_1.Controller)('training/attempts'),
    __metadata("design:paramtypes", [exam_attempt_service_1.ExamAttemptService])
], ExamAttemptController);
//# sourceMappingURL=exam-attempt.controller.js.map