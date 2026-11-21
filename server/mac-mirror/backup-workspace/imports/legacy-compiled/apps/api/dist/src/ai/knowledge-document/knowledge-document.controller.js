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
exports.KnowledgeDocumentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const knowledge_document_service_1 = require("./knowledge-document.service");
const create_knowledge_document_dto_1 = require("./dto/create-knowledge-document.dto");
const update_knowledge_document_dto_1 = require("./dto/update-knowledge-document.dto");
let KnowledgeDocumentController = class KnowledgeDocumentController {
    knowledgeDocumentService;
    constructor(knowledgeDocumentService) {
        this.knowledgeDocumentService = knowledgeDocumentService;
    }
    findAll() {
        return this.knowledgeDocumentService.findMany();
    }
    findOne(id) {
        return this.knowledgeDocumentService.findOneOrThrow(id);
    }
    create(dto) {
        return this.knowledgeDocumentService.create(dto);
    }
    update(id, dto) {
        return this.knowledgeDocumentService.update(id, dto);
    }
    delete(id) {
        return this.knowledgeDocumentService.delete(id);
    }
};
exports.KnowledgeDocumentController = KnowledgeDocumentController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('ai.knowledge-document.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KnowledgeDocumentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('ai.knowledge-document.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KnowledgeDocumentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('ai.knowledge-document.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_knowledge_document_dto_1.CreateKnowledgeDocumentDto]),
    __metadata("design:returntype", void 0)
], KnowledgeDocumentController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('ai.knowledge-document.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_knowledge_document_dto_1.UpdateKnowledgeDocumentDto]),
    __metadata("design:returntype", void 0)
], KnowledgeDocumentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('ai.knowledge-document.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KnowledgeDocumentController.prototype, "delete", null);
exports.KnowledgeDocumentController = KnowledgeDocumentController = __decorate([
    (0, swagger_1.ApiTags)('ai/knowledge-document'),
    (0, common_1.Controller)('ai/knowledge-documents'),
    __metadata("design:paramtypes", [knowledge_document_service_1.KnowledgeDocumentService])
], KnowledgeDocumentController);
//# sourceMappingURL=knowledge-document.controller.js.map