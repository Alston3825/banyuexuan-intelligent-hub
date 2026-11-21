"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeDocumentModule = void 0;
const common_1 = require("@nestjs/common");
const ai_gateway_module_1 = require("../ai-gateway/ai-gateway.module");
const knowledge_document_controller_1 = require("./knowledge-document.controller");
const knowledge_document_service_1 = require("./knowledge-document.service");
let KnowledgeDocumentModule = class KnowledgeDocumentModule {
};
exports.KnowledgeDocumentModule = KnowledgeDocumentModule;
exports.KnowledgeDocumentModule = KnowledgeDocumentModule = __decorate([
    (0, common_1.Module)({
        imports: [ai_gateway_module_1.AiGatewayModule],
        controllers: [knowledge_document_controller_1.KnowledgeDocumentController],
        providers: [knowledge_document_service_1.KnowledgeDocumentService],
        exports: [knowledge_document_service_1.KnowledgeDocumentService],
    })
], KnowledgeDocumentModule);
//# sourceMappingURL=knowledge-document.module.js.map