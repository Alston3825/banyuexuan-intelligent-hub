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
exports.ExamQuestionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class ExamQuestionDto {
    order;
    type;
    content;
    options;
    correctAnswer;
    score;
}
exports.ExamQuestionDto = ExamQuestionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ExamQuestionDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ExamQuestionType }),
    (0, class_validator_1.IsEnum)(client_1.ExamQuestionType),
    __metadata("design:type", typeof (_a = typeof client_1.ExamQuestionType !== "undefined" && client_1.ExamQuestionType) === "function" ? _a : Object)
], ExamQuestionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExamQuestionDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '选择题选项：[{ key, text }]，判断题/简答题为空' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ExamQuestionDto.prototype, "options", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: '正确答案：选择题为选项key数组，判断题为 true/false，简答题为空（人工判分）',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ExamQuestionDto.prototype, "correctAnswer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '该题分值' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ExamQuestionDto.prototype, "score", void 0);
//# sourceMappingURL=exam-question.dto.js.map