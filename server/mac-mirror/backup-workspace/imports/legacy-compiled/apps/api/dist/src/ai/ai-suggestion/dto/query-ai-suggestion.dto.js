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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryAiSuggestionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class QueryAiSuggestionDto {
    scenario;
    businessType;
    businessId;
    status;
}
exports.QueryAiSuggestionDto = QueryAiSuggestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.AiSuggestionScenario }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AiSuggestionScenario),
    __metadata("design:type", typeof (_a = typeof client_1.AiSuggestionScenario !== "undefined" && client_1.AiSuggestionScenario) === "function" ? _a : Object)
], QueryAiSuggestionDto.prototype, "scenario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAiSuggestionDto.prototype, "businessType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAiSuggestionDto.prototype, "businessId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: client_1.AiSuggestionStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AiSuggestionStatus),
    __metadata("design:type", typeof (_b = typeof client_1.AiSuggestionStatus !== "undefined" && client_1.AiSuggestionStatus) === "function" ? _b : Object)
], QueryAiSuggestionDto.prototype, "status", void 0);
//# sourceMappingURL=query-ai-suggestion.dto.js.map