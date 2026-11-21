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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTrainingExamDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const exam_question_dto_1 = require("./exam-question.dto");
class CreateTrainingExamDto {
    title;
    studyMaterial;
    passScore;
    questions;
}
exports.CreateTrainingExamDto = CreateTrainingExamDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainingExamDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '学习资料，自由文本' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainingExamDto.prototype, "studyMaterial", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '及格分数线' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTrainingExamDto.prototype, "passScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [exam_question_dto_1.ExamQuestionDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => exam_question_dto_1.ExamQuestionDto),
    __metadata("design:type", Array)
], CreateTrainingExamDto.prototype, "questions", void 0);
//# sourceMappingURL=create-training-exam.dto.js.map