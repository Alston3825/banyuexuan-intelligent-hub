"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessReportModule = void 0;
const common_1 = require("@nestjs/common");
const business_report_controller_1 = require("./business-report.controller");
const business_report_service_1 = require("./business-report.service");
let BusinessReportModule = class BusinessReportModule {
};
exports.BusinessReportModule = BusinessReportModule;
exports.BusinessReportModule = BusinessReportModule = __decorate([
    (0, common_1.Module)({
        controllers: [business_report_controller_1.BusinessReportController],
        providers: [business_report_service_1.BusinessReportService],
        exports: [business_report_service_1.BusinessReportService],
    })
], BusinessReportModule);
//# sourceMappingURL=business-report.module.js.map