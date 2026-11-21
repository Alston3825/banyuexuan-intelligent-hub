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
exports.AiSuggestionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const ai_suggestion_service_1 = require("./ai-suggestion.service");
const query_ai_suggestion_dto_1 = require("./dto/query-ai-suggestion.dto");
const version_dto_1 = require("./dto/version.dto");
let AiSuggestionController = class AiSuggestionController {
    aiSuggestionService;
    constructor(aiSuggestionService) {
        this.aiSuggestionService = aiSuggestionService;
    }
    findAll(query) {
        return this.aiSuggestionService.findMany(query);
    }
    findOne(id) {
        return this.aiSuggestionService.findOneOrThrow(id);
    }
    accept(id, dto) {
        return this.aiSuggestionService.accept(id, dto.version);
    }
    dismiss(id, dto) {
        return this.aiSuggestionService.dismiss(id, dto.version);
    }
};
exports.AiSuggestionController = AiSuggestionController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('ai.suggestion.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_ai_suggestion_dto_1.QueryAiSuggestionDto]),
    __metadata("design:returntype", void 0)
], AiSuggestionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('ai.suggestion.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiSuggestionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    (0, require_permission_decorator_1.RequirePermission)('ai.suggestion.accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], AiSuggestionController.prototype, "accept", null);
__decorate([
    (0, common_1.Post)(':id/dismiss'),
    (0, require_permission_decorator_1.RequirePermission)('ai.suggestion.dismiss'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, version_dto_1.VersionDto]),
    __metadata("design:returntype", void 0)
], AiSuggestionController.prototype, "dismiss", null);
exports.AiSuggestionController = AiSuggestionController = __decorate([
    (0, swagger_1.ApiTags)('ai/suggestion'),
    (0, common_1.Controller)('ai/suggestions'),
    __metadata("design:paramtypes", [ai_suggestion_service_1.AiSuggestionService])
], AiSuggestionController);
//# sourceMappingURL=ai-suggestion.controller.js.map