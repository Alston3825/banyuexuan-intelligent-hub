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
exports.TrainingExamController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const training_exam_service_1 = require("./training-exam.service");
const create_training_exam_dto_1 = require("./dto/create-training-exam.dto");
const update_training_exam_dto_1 = require("./dto/update-training-exam.dto");
let TrainingExamController = class TrainingExamController {
    trainingExamService;
    constructor(trainingExamService) {
        this.trainingExamService = trainingExamService;
    }
    findAll() {
        return this.trainingExamService.findMany();
    }
    findOne(id) {
        return this.trainingExamService.findOneOrThrow(id);
    }
    create(dto) {
        return this.trainingExamService.create(dto);
    }
    update(id, dto) {
        return this.trainingExamService.update(id, dto);
    }
};
exports.TrainingExamController = TrainingExamController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('training.exam.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrainingExamController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('training.exam.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrainingExamController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('training.exam.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_training_exam_dto_1.CreateTrainingExamDto]),
    __metadata("design:returntype", void 0)
], TrainingExamController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('training.exam.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_training_exam_dto_1.UpdateTrainingExamDto]),
    __metadata("design:returntype", void 0)
], TrainingExamController.prototype, "update", null);
exports.TrainingExamController = TrainingExamController = __decorate([
    (0, swagger_1.ApiTags)('training/exam'),
    (0, common_1.Controller)('training/exams'),
    __metadata("design:paramtypes", [training_exam_service_1.TrainingExamService])
], TrainingExamController);
//# sourceMappingURL=training-exam.controller.js.map