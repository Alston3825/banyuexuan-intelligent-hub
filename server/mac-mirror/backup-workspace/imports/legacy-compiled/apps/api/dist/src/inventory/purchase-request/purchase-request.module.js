"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseRequestModule = void 0;
const common_1 = require("@nestjs/common");
const workflow_engine_module_1 = require("../../workflow/workflow-engine/workflow-engine.module");
const inventory_item_module_1 = require("../inventory-item/inventory-item.module");
const purchase_order_module_1 = require("../purchase-order/purchase-order.module");
const purchase_request_controller_1 = require("./purchase-request.controller");
const purchase_request_service_1 = require("./purchase-request.service");
const purchase_request_import_service_1 = require("./purchase-request-import.service");
let PurchaseRequestModule = class PurchaseRequestModule {
};
exports.PurchaseRequestModule = PurchaseRequestModule;
exports.PurchaseRequestModule = PurchaseRequestModule = __decorate([
    (0, common_1.Module)({
        imports: [workflow_engine_module_1.WorkflowEngineModule, inventory_item_module_1.InventoryItemModule, purchase_order_module_1.PurchaseOrderModule],
        controllers: [purchase_request_controller_1.PurchaseRequestController],
        providers: [purchase_request_service_1.PurchaseRequestService, purchase_request_import_service_1.PurchaseRequestImportService],
    })
], PurchaseRequestModule);
//# sourceMappingURL=purchase-request.module.js.map