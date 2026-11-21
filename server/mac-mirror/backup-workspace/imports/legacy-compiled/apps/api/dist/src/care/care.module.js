"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareModule = void 0;
const common_1 = require("@nestjs/common");
const care_archive_module_1 = require("./care-archive.module");
const care_board_module_1 = require("./care-board/care-board.module");
const care_field_definition_module_1 = require("./care-field-definition/care-field-definition.module");
const care_form_template_module_1 = require("./care-form-template/care-form-template.module");
const care_plan_template_module_1 = require("./care-plan-template/care-plan-template.module");
const mother_profile_module_1 = require("./mother-profile/mother-profile.module");
const baby_profile_module_1 = require("./baby-profile/baby-profile.module");
const care_plan_module_1 = require("./care-plan/care-plan.module");
const care_record_module_1 = require("./care-record/care-record.module");
const care_abnormality_module_1 = require("./care-abnormality/care-abnormality.module");
const care_outreach_template_module_1 = require("./care-outreach-template/care-outreach-template.module");
const care_outreach_plan_module_1 = require("./care-outreach-plan/care-outreach-plan.module");
let CareModule = class CareModule {
};
exports.CareModule = CareModule;
exports.CareModule = CareModule = __decorate([
    (0, common_1.Module)({
        imports: [
            care_archive_module_1.CareArchiveModule,
            care_board_module_1.CareBoardModule,
            care_field_definition_module_1.CareFieldDefinitionModule,
            care_form_template_module_1.CareFormTemplateModule,
            care_plan_template_module_1.CarePlanTemplateModule,
            mother_profile_module_1.MotherProfileModule,
            baby_profile_module_1.BabyProfileModule,
            care_plan_module_1.CarePlanModule,
            care_record_module_1.CareRecordModule,
            care_abnormality_module_1.CareAbnormalityModule,
            care_outreach_template_module_1.CareOutreachTemplateModule,
            care_outreach_plan_module_1.CareOutreachPlanModule,
        ],
    })
], CareModule);
//# sourceMappingURL=care.module.js.map