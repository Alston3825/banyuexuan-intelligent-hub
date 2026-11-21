"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const supplier_module_1 = require("./supplier/supplier.module");
const warehouse_module_1 = require("./warehouse/warehouse.module");
const inventory_item_module_1 = require("./inventory-item/inventory-item.module");
const warehouse_stock_module_1 = require("./warehouse-stock/warehouse-stock.module");
const stock_batch_module_1 = require("./stock-batch/stock-batch.module");
const purchase_order_module_1 = require("./purchase-order/purchase-order.module");
const purchase_request_module_1 = require("./purchase-request/purchase-request.module");
const goods_receipt_module_1 = require("./goods-receipt/goods-receipt.module");
const stock_issue_module_1 = require("./stock-issue/stock-issue.module");
const stock_transfer_module_1 = require("./stock-transfer/stock-transfer.module");
const stock_count_module_1 = require("./stock-count/stock-count.module");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            supplier_module_1.SupplierModule,
            warehouse_module_1.WarehouseModule,
            inventory_item_module_1.InventoryItemModule,
            warehouse_stock_module_1.WarehouseStockModule,
            stock_batch_module_1.StockBatchModule,
            purchase_order_module_1.PurchaseOrderModule,
            purchase_request_module_1.PurchaseRequestModule,
            goods_receipt_module_1.GoodsReceiptModule,
            stock_issue_module_1.StockIssueModule,
            stock_transfer_module_1.StockTransferModule,
            stock_count_module_1.StockCountModule,
        ],
    })
], InventoryModule);
//# sourceMappingURL=inventory.module.js.map