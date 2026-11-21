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
exports.GradeExamAttemptDto = exports.GradeAnswerInputDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class GradeAnswerInputDto {
    answerId;
    score;
}
exports.GradeAnswerInputDto = GradeAnswerInputDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GradeAnswerInputDto.prototype, "answerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '该题（简答题）人工给分' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GradeAnswerInputDto.prototype, "score", void 0);
class GradeExamAttemptDto {
    answers;
}
exports.GradeExamAttemptDto = GradeExamAttemptDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GradeAnswerInputDto], description: '仅需提供简答题的批阅得分' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GradeAnswerInputDto),
    __metadata("design:type", Array)
], GradeExamAttemptDto.prototype, "answers", void 0);
//# sourceMappingURL=grade-exam-attempt.dto.js.map