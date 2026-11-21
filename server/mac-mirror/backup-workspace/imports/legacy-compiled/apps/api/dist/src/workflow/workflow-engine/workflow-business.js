"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKFLOW_BUSINESS = void 0;
exports.businessLabel = businessLabel;
exports.businessPath = businessPath;
exports.WORKFLOW_BUSINESS = {
    PURCHASE_REQUEST: { label: '申购单', path: '/inventory/purchase-requests' },
    PURCHASE_ORDER: { label: '采购单', path: '/inventory/purchase-orders' },
    GOODS_RECEIPT: { label: '入库单', path: '/inventory/goods-receipts' },
    STOCK_ISSUE: { label: '出库/领用单', path: '/inventory/stock-issues' },
    STOCK_TRANSFER: { label: '调拨单', path: '/inventory/stock-transfers' },
    STOCK_COUNT: { label: '盘点单', path: '/inventory/stock-counts' },
    LEAVE_REQUEST: { label: '请假申请', path: '/office/leave-requests' },
    EXPENSE_CLAIM: { label: '报销申请', path: '/office/expense-claims' },
    GENERAL_MEMO: { label: '日常签呈', path: '/office/general-memos' },
    COMMISSION_RECORD: { label: '业绩提成', path: '/hr/commission-records' },
    PAYROLL_RECORD: { label: '薪资单', path: '/hr/payroll-records' },
    PAYMENT: { label: '收款/退款', path: '/payment/records' },
    CONTRACT: { label: '合同', path: '/contract/records' },
    DEMO_APPROVAL: { label: '示例审批单', path: '/workflow/demo-approvals' },
};
function businessLabel(type) {
    return exports.WORKFLOW_BUSINESS[type]?.label ?? type;
}
function businessPath(type) {
    return exports.WORKFLOW_BUSINESS[type]?.path ?? null;
}
//# sourceMappingURL=workflow-business.js.map