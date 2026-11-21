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
exports.UpdateTrainingExamDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const exam_question_dto_1 = require("./exam-question.dto");
class UpdateTrainingExamDto {
    title;
    studyMaterial;
    passScore;
    status;
    questions;
    version;
}
exports.UpdateTrainingExamDto = UpdateTrainingExamDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrainingExamDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrainingExamDto.prototype, "studyMaterial", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateTrainingExamDto.prototype, "passScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.TrainingExamStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TrainingExamStatus),
    __metadata("design:type", typeof (_a = typeof client_1.TrainingExamStatus !== "undefined" && client_1.TrainingExamStatus) === "function" ? _a : Object)
], UpdateTrainingExamDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [exam_question_dto_1.ExamQuestionDto], required: false, description: '若提供则整体替换题目列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => exam_question_dto_1.ExamQuestionDto),
    __metadata("design:type", Array)
], UpdateTrainingExamDto.prototype, "questions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '乐观锁版本号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateTrainingExamDto.prototype, "version", void 0);
//# sourceMappingURL=update-training-exam.dto.js.map