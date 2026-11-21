"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareAbnormalityModule = void 0;
const common_1 = require("@nestjs/common");
const care_abnormality_controller_1 = require("./care-abnormality.controller");
const care_abnormality_service_1 = require("./care-abnormality.service");
const follow_up_module_1 = require("../../crm/follow-up/follow-up.module");
let CareAbnormalityModule = class CareAbnormalityModule {
};
exports.CareAbnormalityModule = CareAbnormalityModule;
exports.CareAbnormalityModule = CareAbnormalityModule = __decorate([
    (0, common_1.Module)({
        imports: [follow_up_module_1.FollowUpModule],
        controllers: [care_abnormality_controller_1.CareAbnormalityController],
        providers: [care_abnormality_service_1.CareAbnormalityService],
        exports: [care_abnormality_service_1.CareAbnormalityService],
    })
], CareAbnormalityModule);
//# sourceMappingURL=care-abnormality.module.js.map