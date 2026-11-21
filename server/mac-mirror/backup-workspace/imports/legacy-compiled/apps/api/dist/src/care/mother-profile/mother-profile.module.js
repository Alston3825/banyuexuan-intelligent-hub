"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotherProfileModule = void 0;
const common_1 = require("@nestjs/common");
const mother_profile_controller_1 = require("./mother-profile.controller");
const mother_profile_service_1 = require("./mother-profile.service");
const care_archive_module_1 = require("../care-archive.module");
const customer_module_1 = require("../../crm/customer/customer.module");
const recycle_bin_module_1 = require("../../common/recycle/recycle-bin.module");
let MotherProfileModule = class MotherProfileModule {
};
exports.MotherProfileModule = MotherProfileModule;
exports.MotherProfileModule = MotherProfileModule = __decorate([
    (0, common_1.Module)({
        imports: [recycle_bin_module_1.RecycleBinModule, customer_module_1.CustomerModule, care_archive_module_1.CareArchiveModule],
        controllers: [mother_profile_controller_1.MotherProfileController],
        providers: [mother_profile_service_1.MotherProfileService],
        exports: [mother_profile_service_1.MotherProfileService],
    })
], MotherProfileModule);
//# sourceMappingURL=mother-profile.module.js.map