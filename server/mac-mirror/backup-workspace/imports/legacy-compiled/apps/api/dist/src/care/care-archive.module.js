"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareArchiveModule = void 0;
const common_1 = require("@nestjs/common");
const ai_gateway_module_1 = require("../ai/ai-gateway/ai-gateway.module");
const care_assessment_controller_1 = require("./care-assessment/care-assessment.controller");
const care_assessment_service_1 = require("./care-assessment/care-assessment.service");
const care_daily_controller_1 = require("./care-daily/care-daily.controller");
const care_daily_service_1 = require("./care-daily/care-daily.service");
const care_medication_controller_1 = require("./care-medication/care-medication.controller");
const care_medication_service_1 = require("./care-medication/care-medication.service");
const care_plan_version_controller_1 = require("./care-plan-version/care-plan-version.controller");
const care_plan_version_service_1 = require("./care-plan-version/care-plan-version.service");
const care_growth_controller_1 = require("./growth/care-growth.controller");
const care_growth_service_1 = require("./growth/care-growth.service");
const care_stats_controller_1 = require("./care-stats/care-stats.controller");
const care_stats_service_1 = require("./care-stats/care-stats.service");
const care_document_controller_1 = require("./care-document/care-document.controller");
const care_document_extraction_service_1 = require("./care-document/care-document-extraction.service");
const care_document_service_1 = require("./care-document/care-document.service");
const care_storage_service_1 = require("./care-document/care-storage.service");
const care_confirm_public_service_1 = require("./care-signature/care-confirm-public.service");
const care_signature_controller_1 = require("./care-signature/care-signature.controller");
const care_signature_service_1 = require("./care-signature/care-signature.service");
let CareArchiveModule = class CareArchiveModule {
};
exports.CareArchiveModule = CareArchiveModule;
exports.CareArchiveModule = CareArchiveModule = __decorate([
    (0, common_1.Module)({
        imports: [ai_gateway_module_1.AiGatewayModule],
        controllers: [care_signature_controller_1.MySignatureController, care_signature_controller_1.CareSignatureController, care_signature_controller_1.PublicCareConfirmController, care_document_controller_1.CareDocumentController, care_assessment_controller_1.CareAssessmentController, care_daily_controller_1.CareDailyController, care_medication_controller_1.CareMedicationController, care_plan_version_controller_1.CarePlanVersionController, care_growth_controller_1.CareGrowthController, care_growth_controller_1.PublicGrowthController, care_stats_controller_1.CareStatsController],
        providers: [care_signature_service_1.CareSignatureService, care_confirm_public_service_1.CareConfirmPublicService, care_storage_service_1.CareStorageService, care_document_extraction_service_1.CareDocumentExtractionService, care_document_service_1.CareDocumentService, care_assessment_service_1.CareAssessmentService, care_daily_service_1.CareDailyService, care_medication_service_1.CareMedicationService, care_plan_version_service_1.CarePlanVersionService, care_plan_version_service_1.CareServiceLogService, care_growth_service_1.CareGrowthService, care_stats_service_1.CareStatsService],
        exports: [care_storage_service_1.CareStorageService],
    })
], CareArchiveModule);
//# sourceMappingURL=care-archive.module.js.map