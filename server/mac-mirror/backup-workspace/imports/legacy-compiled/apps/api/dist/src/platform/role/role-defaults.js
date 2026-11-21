"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ROLES = void 0;
exports.resolveDefaultCodes = resolveDefaultCodes;
const SELF_SERVICE = [
    'office.leave-request.view', 'office.leave-request.create', 'office.leave-request.submit', 'office.leave-request.cancel',
    'office.expense-claim.view', 'office.expense-claim.create', 'office.expense-claim.submit', 'office.expense-claim.cancel',
    'office.general-memo.view', 'office.general-memo.create', 'office.general-memo.submit', 'office.general-memo.cancel',
    'training.exam-attempt.view', 'training.exam-attempt.submit',
    'workflow.instance.view',
];
const PURCHASE_REQUEST_FILL = [
    'inventory.purchase-request.view', 'inventory.purchase-request.create', 'inventory.purchase-request.update',
    'inventory.purchase-request.submit', 'inventory.purchase-request.cancel',
    'inventory.item.view',
];
const CARE_DAILY = [
    'care.board.view',
    'care.profile.view', 'care.profile.create', 'care.profile.update',
    'care.plan.view', 'care.plan.create', 'care.plan.terminate',
    'care.record.view', 'care.record.create',
    'care.abnormality.view', 'care.abnormality.follow-up', 'care.abnormality.resolve', 'care.abnormality.ignore',
    'care.outreach-plan.view', 'care.outreach-plan.create', 'care.outreach-plan.complete-task', 'care.outreach-plan.terminate',
    'meal.diner-profile.view', 'meal.record.view',
    'room.room.view', 'room.occupancy.view',
];
exports.DEFAULT_ROLES = [
    {
        code: 'STORE_MANAGER',
        name: '店长',
        description: '门店日常管理与一级审批，无账号手机号查看权限、无门店删除权限',
        derive: storeManagerCodes,
    },
    {
        code: 'STORE_STAFF',
        name: '普通员工',
        description: '门店一线日常业务操作，不含经营分析/设备网关/账号权限/组织架构/基础资料/审计日志',
        derive: storeStaffCodes,
    },
    {
        code: 'DEPT_HEAD',
        name: '部门负责人',
        description: '部门日常管理：本部门申购、护理/月子餐/房态/产康/库存/人事/合同/办公审批等业务；不含账号、角色、组织架构、审计日志',
        perms: [
            'ai.business-analytics-agent.analyze',
            'ai.care-abnormality-agent.suggest',
            'ai.knowledge-document.create', 'ai.knowledge-document.update', 'ai.knowledge-document.view',
            'analytics.dashboard.view',
            'care.abnormality.follow-up', 'care.abnormality.ignore', 'care.abnormality.resolve', 'care.abnormality.view',
            'care.board.view',
            'care.outreach-plan.complete-task', 'care.outreach-plan.create', 'care.outreach-plan.terminate', 'care.outreach-plan.view',
            'care.plan.create', 'care.plan.terminate', 'care.plan.view',
            'care.profile.approve', 'care.profile.create', 'care.profile.update', 'care.profile.view',
            'care.record.create', 'care.record.view',
            'contract.record.confirm', 'contract.record.delete', 'contract.record.update', 'contract.record.upload', 'contract.record.view', 'contract.record.void',
            'hr.commission-record.cancel', 'hr.commission-record.create', 'hr.commission-record.submit', 'hr.commission-record.view',
            'hr.employee-profile.create', 'hr.employee-profile.update', 'hr.employee-profile.view',
            'hr.payroll-record.view',
            'hr.schedule-entry.create', 'hr.schedule-entry.delete', 'hr.schedule-entry.update', 'hr.schedule-entry.view',
            'hr.shift-definition.create', 'hr.shift-definition.update', 'hr.shift-definition.view',
            'inventory.goods-receipt.cancel', 'inventory.goods-receipt.create', 'inventory.goods-receipt.execute', 'inventory.goods-receipt.receive', 'inventory.goods-receipt.submit', 'inventory.goods-receipt.view',
            'inventory.item.view',
            'inventory.purchase-order.cancel', 'inventory.purchase-order.create', 'inventory.purchase-order.purchase', 'inventory.purchase-order.submit', 'inventory.purchase-order.view',
            'inventory.purchase-request.cancel', 'inventory.purchase-request.create', 'inventory.purchase-request.submit', 'inventory.purchase-request.update', 'inventory.purchase-request.view',
            'inventory.warehouse-stock.view',
            'logistics.utility-expense.create', 'logistics.utility-expense.update', 'logistics.utility-expense.view',
            'logistics.vehicle.create', 'logistics.vehicle.update', 'logistics.vehicle.view',
            'logistics.vehicle-booking.cancel', 'logistics.vehicle-booking.create', 'logistics.vehicle-booking.view',
            'meal.dietary-restriction.create', 'meal.dietary-restriction.update', 'meal.dietary-restriction.view',
            'meal.diner-profile.create', 'meal.diner-profile.end', 'meal.diner-profile.view',
            'meal.item.create', 'meal.item.update', 'meal.item.view',
            'meal.plan-template.create', 'meal.plan-template.update', 'meal.plan-template.view',
            'meal.record.feedback', 'meal.record.select', 'meal.record.serve', 'meal.record.view',
            'office.expense-claim.cancel', 'office.expense-claim.create', 'office.expense-claim.submit', 'office.expense-claim.view',
            'office.general-memo.cancel', 'office.general-memo.create', 'office.general-memo.submit', 'office.general-memo.view',
            'office.leave-request.cancel', 'office.leave-request.create', 'office.leave-request.submit', 'office.leave-request.view',
            'room.call.create', 'room.call.handle', 'room.call.view',
            'room.occupancy.cancel', 'room.occupancy.checkin', 'room.occupancy.checkout', 'room.occupancy.create', 'room.occupancy.reschedule', 'room.occupancy.view',
            'room.outing.cancel', 'room.outing.checkback', 'room.outing.checkout', 'room.outing.create', 'room.outing.view',
            'room.room.clean', 'room.room.create', 'room.room.maintenance', 'room.room.update', 'room.room.view',
            'room.service-requisition.create', 'room.service-requisition.fulfill', 'room.service-requisition.view',
            'room.type.create', 'room.type.update', 'room.type.view',
            'service.appointment.cancel', 'service.appointment.complete', 'service.appointment.create', 'service.appointment.feedback', 'service.appointment.view',
            'service.customer-package.create', 'service.customer-package.view',
            'service.package.create', 'service.package.update', 'service.package.view',
            'service.product.create', 'service.product.update', 'service.product.view',
            'service.therapist.create', 'service.therapist.update', 'service.therapist.view',
            'training.exam.create', 'training.exam.update', 'training.exam.view',
            'training.exam-attempt.grade', 'training.exam-attempt.submit', 'training.exam-attempt.view',
            'workflow.definition.view',
            'workflow.demo-approval.create', 'workflow.demo-approval.view',
            'workflow.instance.add-approver', 'workflow.instance.approve', 'workflow.instance.archive', 'workflow.instance.cc', 'workflow.instance.reassign', 'workflow.instance.reject', 'workflow.instance.view', 'workflow.instance.withdraw',
        ],
    },
    {
        code: 'NURSE_LEAD',
        name: '护理长',
        description: '护理部日常管理：护理档案/计划/记录/异常/离店关怀、护理部排班、填写护理部申购单；不含审核护理计划',
        perms: [
            ...CARE_DAILY, ...PURCHASE_REQUEST_FILL, ...SELF_SERVICE,
            'care.growth.edit',
            'hr.shift-definition.view', 'hr.schedule-entry.view', 'hr.schedule-entry.create', 'hr.schedule-entry.update', 'hr.schedule-entry.delete',
            'ai.care-abnormality-agent.*',
        ],
    },
    {
        code: 'NURSE',
        name: '护理师',
        description: '一线护理：查看母婴档案与护理计划、填写日常护理记录、查看异常提醒',
        perms: [
            'care.board.view', 'care.profile.view', 'care.plan.view', 'care.record.view', 'care.record.create', 'care.abnormality.view',
            'meal.diner-profile.view', 'meal.record.view', 'room.room.view', 'room.occupancy.view',
            ...SELF_SERVICE,
        ],
    },
    {
        code: 'CUSTOMER_SERVICE',
        name: '客服',
        description: '汇总各部门申购单并提交店长审批；货到后逐项确认收货、入库',
        perms: [
            'inventory.purchase-request.view', 'inventory.purchase-request.create', 'inventory.purchase-request.update', 'inventory.purchase-request.submit', 'inventory.purchase-request.cancel', 'inventory.purchase-request.convert', 'inventory.purchase-request.collect',
            'inventory.purchase-order.view', 'inventory.goods-receipt.view', 'inventory.goods-receipt.receive',
            'inventory.item.view', 'inventory.warehouse.view', 'inventory.supplier.view', 'inventory.warehouse-stock.view',
            'satisfaction.survey.view', 'satisfaction.survey.create', 'satisfaction.survey.update', 'satisfaction.template.view',
            ...SELF_SERVICE,
        ],
    },
    {
        code: 'PURCHASER',
        name: '采购员',
        description: '收到店长批准的申购单后生成采购单、去采购，采购完点“确认采购”',
        perms: [
            'inventory.purchase-request.view', 'inventory.purchase-request.convert',
            'inventory.purchase-order.view', 'inventory.purchase-order.create', 'inventory.purchase-order.purchase', 'inventory.purchase-order.cancel',
            'inventory.goods-receipt.view',
            'inventory.supplier.view', 'inventory.supplier.create', 'inventory.supplier.update', 'inventory.item.view', 'inventory.warehouse.view',
            ...SELF_SERVICE,
        ],
    },
];
function resolveDefaultCodes(roleCode, allCodes) {
    const def = exports.DEFAULT_ROLES.find((r) => r.code === roleCode);
    if (!def)
        return undefined;
    if (def.derive)
        return def.derive(allCodes);
    const all = new Set(allCodes);
    const out = new Set();
    for (const p of def.perms ?? []) {
        if (p.endsWith('.*')) {
            const base = p.slice(0, -2);
            for (const c of allCodes)
                if (c.startsWith(`${base}.`))
                    out.add(c);
        }
        else if (all.has(p)) {
            out.add(p);
        }
    }
    return [...out];
}
function storeManagerCodes(allCodes) {
    const storeManagerExcluded = new Set([
        'crm.channel.create',
        'crm.channel.update',
        'crm.customer.delete',
        'crm.customer.force-delete',
        'crm.customer.restore',
        'platform.store.delete',
        'room.room.force-delete',
        'inventory.item.force-delete',
        'care.profile.force-delete',
        'hr.employee-profile.change-no',
        'hr.employee-profile.restore',
        'crm.lead.lose',
        'crm.opportunity.lose',
        'contract.record.void',
        'finance.customer-account.adjust',
        'logistics.vehicle.create',
        'logistics.vehicle.update',
        'iot.device-type.create',
        'iot.device-type.update',
    ]);
    const codes = allCodes
        .filter((code) => !storeManagerExcluded.has(code) &&
        (code.startsWith('platform.store') ||
            code.startsWith('platform.account') ||
            code === 'workflow' ||
            code.startsWith('workflow.instance') ||
            code.startsWith('workflow.demo-approval') ||
            code === 'audit' ||
            code === 'audit.log' ||
            code === 'audit.log.view' ||
            code === 'platform' ||
            code.startsWith('crm') ||
            code.startsWith('contract.record') ||
            code.startsWith('room.room') ||
            code.startsWith('room.occupancy') ||
            code.startsWith('room.call') ||
            code.startsWith('room.outing') ||
            code.startsWith('room.service-requisition') ||
            code.startsWith('payment.record') ||
            code.startsWith('care.board') ||
            code.startsWith('care.profile') ||
            code.startsWith('care.growth') ||
            code === 'care.plan' ||
            code.startsWith('care.plan.') ||
            code.startsWith('care.record') ||
            code.startsWith('care.abnormality') ||
            code.startsWith('meal.diner-profile') ||
            code.startsWith('meal.record') ||
            code.startsWith('service.customer-package') ||
            code.startsWith('service.appointment') ||
            code.startsWith('inventory.warehouse') ||
            code.startsWith('inventory.stock-batch') ||
            code.startsWith('inventory.purchase-request') ||
            code.startsWith('inventory.purchase-order') ||
            code.startsWith('inventory.goods-receipt') ||
            code.startsWith('inventory.stock-issue') ||
            code.startsWith('inventory.stock-transfer') ||
            code.startsWith('inventory.stock-count') ||
            code.startsWith('hr.employee-profile') ||
            code.startsWith('hr.shift-definition') ||
            code.startsWith('hr.schedule-entry') ||
            code.startsWith('hr.commission-record') ||
            code.startsWith('hr.payroll-record') ||
            code.startsWith('finance.customer-account') ||
            code.startsWith('office.leave-request') ||
            code.startsWith('office.expense-claim') ||
            code.startsWith('office.general-memo') ||
            code.startsWith('logistics.vehicle') ||
            code.startsWith('logistics.utility-expense') ||
            code.startsWith('ai.customer-service-agent') ||
            code.startsWith('ai.care-abnormality-agent') ||
            code.startsWith('ai.suggestion') ||
            code.startsWith('integration.binding') ||
            code.startsWith('iot.device-type') ||
            code.startsWith('iot.device-registry') ||
            code.startsWith('iot.device-event') ||
            code.startsWith('ai.business-analytics-agent') ||
            code.startsWith('analytics.dashboard') ||
            code.startsWith('training.exam-attempt') ||
            code.startsWith('care.outreach-plan')));
    return codes;
}
function storeStaffCodes(allCodes) {
    const storeManagerCodes_ = storeManagerCodes(allCodes);
    const storeStaffExcluded = new Set(['care.growth.edit', 'room.room.delete', 'care.profile.approve', 'hr.employee-profile.archive', 'crm.customer.archive', 'crm.customer.merge', 'hr.payroll-record.view-all']);
    return storeManagerCodes_.filter((code) => !storeStaffExcluded.has(code) &&
        !code.startsWith('platform') &&
        !code.startsWith('audit') &&
        !code.startsWith('analytics') &&
        !code.startsWith('iot'));
}
//# sourceMappingURL=role-defaults.js.map