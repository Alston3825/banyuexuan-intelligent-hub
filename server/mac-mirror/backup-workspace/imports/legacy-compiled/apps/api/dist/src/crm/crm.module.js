"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmModule = void 0;
const common_1 = require("@nestjs/common");
const customer_module_1 = require("./customer/customer.module");
const customer_channel_module_1 = require("./customer-channel/customer-channel.module");
const lead_module_1 = require("./lead/lead.module");
const opportunity_module_1 = require("./opportunity/opportunity.module");
const follow_up_module_1 = require("./follow-up/follow-up.module");
let CrmModule = class CrmModule {
};
exports.CrmModule = CrmModule;
exports.CrmModule = CrmModule = __decorate([
    (0, common_1.Module)({
        imports: [customer_module_1.CustomerModule, customer_channel_module_1.CustomerChannelModule, lead_module_1.LeadModule, opportunity_module_1.OpportunityModule, follow_up_module_1.FollowUpModule],
    })
], CrmModule);
//# sourceMappingURL=crm.module.js.map