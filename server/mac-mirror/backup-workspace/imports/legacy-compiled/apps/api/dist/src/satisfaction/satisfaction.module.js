"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SatisfactionModule = void 0;
const common_1 = require("@nestjs/common");
const ai_gateway_module_1 = require("../ai/ai-gateway/ai-gateway.module");
const care_archive_module_1 = require("../care/care-archive.module");
const satisfaction_controller_1 = require("./satisfaction.controller");
const satisfaction_extraction_service_1 = require("./satisfaction-extraction.service");
const satisfaction_template_controller_1 = require("./satisfaction-template.controller");
const satisfaction_template_service_1 = require("./satisfaction-template.service");
const satisfaction_service_1 = require("./satisfaction.service");
let SatisfactionModule = class SatisfactionModule {
};
exports.SatisfactionModule = SatisfactionModule;
exports.SatisfactionModule = SatisfactionModule = __decorate([
    (0, common_1.Module)({
        imports: [ai_gateway_module_1.AiGatewayModule, care_archive_module_1.CareArchiveModule],
        controllers: [satisfaction_controller_1.SatisfactionController, satisfaction_template_controller_1.SatisfactionTemplateController],
        providers: [satisfaction_service_1.SatisfactionService, satisfaction_template_service_1.SatisfactionTemplateService, satisfaction_extraction_service_1.SatisfactionExtractionService],
    })
], SatisfactionModule);
//# sourceMappingURL=satisfaction.module.js.map