"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareOutreachTemplateModule = void 0;
const common_1 = require("@nestjs/common");
const care_outreach_template_controller_1 = require("./care-outreach-template.controller");
const care_outreach_template_service_1 = require("./care-outreach-template.service");
let CareOutreachTemplateModule = class CareOutreachTemplateModule {
};
exports.CareOutreachTemplateModule = CareOutreachTemplateModule;
exports.CareOutreachTemplateModule = CareOutreachTemplateModule = __decorate([
    (0, common_1.Module)({
        controllers: [care_outreach_template_controller_1.CareOutreachTemplateController],
        providers: [care_outreach_template_service_1.CareOutreachTemplateService],
        exports: [care_outreach_template_service_1.CareOutreachTemplateService],
    })
], CareOutreachTemplateModule);
//# sourceMappingURL=care-outreach-template.module.js.map