"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const role_defaults_1 = require("../src/platform/role/role-defaults");
const business_no_util_1 = require("../src/common/utils/business-no.util");
const prisma = new client_1.PrismaClient();
const isProduction = process.env.NODE_ENV === 'production';
const SEED_PASSWORD = process.env.SEED_DEV_PASSWORD ?? 'Passw0rd!23';
const TENANT_CODE = process.env.SEED_TENANT_CODE ?? 'banyuexuan';
const TENANT_NAME = process.env.SEED_TENANT_NAME ?? '伴月轩月子中心（示例租户）';
const STORE_CODE = process.env.SEED_STORE_CODE ?? 'ST001';
const STORE_NAME = process.env.SEED_STORE_NAME ?? '伴月轩·示例店';
const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? SEED_PASSWORD;
if (isProduction) {
    const missing = ['SEED_TENANT_CODE', 'SEED_TENANT_NAME', 'SEED_STORE_CODE', 'SEED_STORE_NAME', 'SEED_ADMIN_USERNAME', 'SEED_ADMIN_PASSWORD'].filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`生产环境(NODE_ENV=production)运行seed必须显式提供以下环境变量，不能沿用开发默认值：${missing.join(', ')}`);
    }
    if (ADMIN_PASSWORD === 'Passw0rd!23' || ADMIN_PASSWORD.length < 12) {
        throw new Error('SEED_ADMIN_PASSWORD 不能是开发默认密码，且长度至少12位，请用 openssl rand -base64 16 生成');
    }
}
async function main() {
    console.log('开始 seed...');
    const tenant = await prisma.tenant.upsert({
        where: { code: TENANT_CODE },
        update: {},
        create: { code: TENANT_CODE, name: TENANT_NAME },
    });
    const region = await prisma.region.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: 'HQ' } },
        update: {},
        create: { tenantId: tenant.id, code: 'HQ', name: '总部区域', createdBy: 'SEED' },
    });
    const builtinChannelTypes = [
        { legacySource: 'WALK_IN', name: '自然到店' },
        { legacySource: 'REFERRAL', name: '转介绍' },
        { legacySource: 'ONLINE_AD', name: '线上广告' },
        { legacySource: 'SOCIAL_MEDIA', name: '社交媒体/私域' },
        { legacySource: 'PARTNER', name: '渠道合作' },
        { legacySource: 'OTHER', name: '其他' },
    ];
    for (const [i, t] of builtinChannelTypes.entries()) {
        await prisma.customerChannelType.upsert({
            where: { tenantId_legacySource: { tenantId: tenant.id, legacySource: t.legacySource } },
            update: {},
            create: { tenantId: tenant.id, legacySource: t.legacySource, name: t.name, sortOrder: i + 1, createdBy: 'SEED' },
        });
    }
    const store = await prisma.store.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: STORE_CODE } },
        update: {},
        create: {
            tenantId: tenant.id,
            regionId: region.id,
            code: STORE_CODE,
            name: STORE_NAME,
            status: 'ACTIVE',
            createdBy: 'SEED',
        },
    });
    const department = await prisma.department.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: 'DEPT_MGMT' } },
        update: {},
        create: {
            tenantId: tenant.id,
            storeId: store.id,
            code: 'DEPT_MGMT',
            name: '管理部',
            createdBy: 'SEED',
        },
    });
    const team = await prisma.team.upsert({
        where: { departmentId_code: { departmentId: department.id, code: 'TEAM_PLATFORM' } },
        update: {},
        create: {
            tenantId: tenant.id,
            storeId: store.id,
            departmentId: department.id,
            code: 'TEAM_PLATFORM',
            name: '平台管理组',
            createdBy: 'SEED',
        },
    });
    const position = await prisma.position.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: 'POS_ADMIN' } },
        update: {},
        create: { tenantId: tenant.id, code: 'POS_ADMIN', name: '系统管理员', createdBy: 'SEED' },
    });
    const application = await prisma.application.upsert({
        where: { code: 'admin-web' },
        update: {},
        create: { code: 'admin-web', name: '后台管理前端（预留）', type: 'WEB', createdBy: 'SEED' },
    });
    const permSpecs = [
        { code: 'platform', name: '平台管理', type: 'MODULE' },
        ...[
            'tenant',
            'region',
            'store',
            'department',
            'team',
            'position',
            'account',
            'role',
            'permission',
            'application',
            'tag',
            'parameter',
        ].map((sub) => ({ code: `platform.${sub}`, name: `平台管理-${sub}`, type: 'PAGE', parentCode: 'platform' })),
        { code: 'workflow', name: '审批流程', type: 'MODULE' },
        { code: 'workflow.instance', name: '审批流程-实例', type: 'PAGE', parentCode: 'workflow' },
        { code: 'workflow.demo-approval', name: '审批流程-示例审批单', type: 'PAGE', parentCode: 'workflow' },
        { code: 'workflow.definition', name: '审批流程-流程设置', type: 'PAGE', parentCode: 'workflow' },
        { code: 'audit', name: '审计日志', type: 'MODULE' },
        { code: 'audit.log', name: '审计日志-查询', type: 'PAGE', parentCode: 'audit' },
        { code: 'crm', name: '客户与线索管理', type: 'MODULE' },
        { code: 'crm.customer', name: 'CRM-客户', type: 'PAGE', parentCode: 'crm' },
        { code: 'crm.channel', name: 'CRM-客户渠道', type: 'PAGE', parentCode: 'crm' },
        { code: 'crm.lead', name: 'CRM-线索', type: 'PAGE', parentCode: 'crm' },
        { code: 'crm.opportunity', name: 'CRM-销售机会', type: 'PAGE', parentCode: 'crm' },
        { code: 'crm.follow-up', name: 'CRM-跟进记录', type: 'PAGE', parentCode: 'crm' },
        { code: 'contract', name: '合同管理', type: 'MODULE' },
        { code: 'contract.record', name: '合同管理-合同', type: 'PAGE', parentCode: 'contract' },
        { code: 'room', name: '房态预订', type: 'MODULE' },
        { code: 'room.type', name: '房态预订-房型', type: 'PAGE', parentCode: 'room' },
        { code: 'room.room', name: '房态预订-房间', type: 'PAGE', parentCode: 'room' },
        { code: 'room.occupancy', name: '房态预订-占用记录', type: 'PAGE', parentCode: 'room' },
        { code: 'room.call', name: '房态预订-呼叫记录', type: 'PAGE', parentCode: 'room' },
        { code: 'room.outing', name: '房态预订-外出管理', type: 'PAGE', parentCode: 'room' },
        { code: 'room.service-requisition', name: '房态预订-客房服务领用', type: 'PAGE', parentCode: 'room' },
        { code: 'payment', name: '收款管理', type: 'MODULE' },
        { code: 'payment.record', name: '收款管理-收款', type: 'PAGE', parentCode: 'payment' },
        { code: 'satisfaction', name: '满意度调查', type: 'MODULE' },
        { code: 'satisfaction.survey', name: '满意度调查-调查记录与统计', type: 'PAGE', parentCode: 'satisfaction' },
        { code: 'satisfaction.template', name: '满意度调查-模板管理', type: 'PAGE', parentCode: 'satisfaction' },
        { code: 'care', name: '护理', type: 'MODULE' },
        { code: 'care.field', name: '护理-护理字段管理', type: 'PAGE', parentCode: 'care' },
        { code: 'care.form-template', name: '护理-护理项目管理', type: 'PAGE', parentCode: 'care' },
        { code: 'care.plan-template', name: '护理-护理方案管理', type: 'PAGE', parentCode: 'care' },
        { code: 'care.board', name: '护理-护理看板', type: 'PAGE', parentCode: 'care' },
        { code: 'care.profile', name: '护理-母婴档案', type: 'PAGE', parentCode: 'care' },
        { code: 'care.growth', name: '护理-生长曲线', type: 'PAGE', parentCode: 'care' },
        { code: 'care.plan', name: '护理-护理计划', type: 'PAGE', parentCode: 'care' },
        { code: 'care.record', name: '护理-护理记录', type: 'PAGE', parentCode: 'care' },
        { code: 'care.abnormality', name: '护理-护理异常', type: 'PAGE', parentCode: 'care' },
        { code: 'care.outreach-template', name: '护理-关怀模板管理', type: 'PAGE', parentCode: 'care' },
        { code: 'care.outreach-plan', name: '护理-离店后关怀', type: 'PAGE', parentCode: 'care' },
        { code: 'meal', name: '月子餐', type: 'MODULE' },
        { code: 'meal.item', name: '月子餐-菜品管理', type: 'PAGE', parentCode: 'meal' },
        { code: 'meal.dietary-restriction', name: '月子餐-禁忌管理', type: 'PAGE', parentCode: 'meal' },
        { code: 'meal.plan-template', name: '月子餐-膳食计划管理', type: 'PAGE', parentCode: 'meal' },
        { code: 'meal.diner-profile', name: '月子餐-用膳人', type: 'PAGE', parentCode: 'meal' },
        { code: 'meal.record', name: '月子餐-排餐记录', type: 'PAGE', parentCode: 'meal' },
        { code: 'service', name: '产康服务', type: 'MODULE' },
        { code: 'service.product', name: '产康服务-项目', type: 'PAGE', parentCode: 'service' },
        { code: 'service.package', name: '产康服务-服务包', type: 'PAGE', parentCode: 'service' },
        { code: 'service.therapist', name: '产康服务-技师', type: 'PAGE', parentCode: 'service' },
        { code: 'service.customer-package', name: '产康服务-客户已购服务包', type: 'PAGE', parentCode: 'service' },
        { code: 'service.appointment', name: '产康服务-预约', type: 'PAGE', parentCode: 'service' },
        { code: 'inventory', name: '库存', type: 'MODULE' },
        { code: 'inventory.supplier', name: '库存-供应商', type: 'PAGE', parentCode: 'inventory' },
        { code: 'inventory.warehouse', name: '库存-仓库', type: 'PAGE', parentCode: 'inventory' },
        { code: 'inventory.item', name: '库存-物品', type: 'PAGE', parentCode: 'inventory' },
        { code: 'inventory.warehouse-stock', name: '库存-库存查询', type: 'PAGE', parentCode: 'inventory' },
        { code: 'inventory.stock-batch', name: '库存-批次与效期', type: 'PAGE', parentCode: 'inventory' },
        { code: 'inventory.purchase-request', name: '库存-申购单', type: 'PAGE', parentCode: 'inventory' },
        { code: 'inventory.purchase-order', name: '库存-采购单', type: 'PAGE', parentCode: 'inventory' },
        { code: 'inventory.goods-receipt', name: '库存-入库单', type: 'PAGE', parentCode: 'inventory' },
        { code: 'inventory.stock-issue', name: '库存-出库/领用单', type: 'PAGE', parentCode: 'inventory' },
        { code: 'inventory.stock-transfer', name: '库存-调拨单', type: 'PAGE', parentCode: 'inventory' },
        { code: 'inventory.stock-count', name: '库存-盘点单', type: 'PAGE', parentCode: 'inventory' },
        { code: 'hr', name: '人事', type: 'MODULE' },
        { code: 'hr.employee-profile', name: '人事-员工档案', type: 'PAGE', parentCode: 'hr' },
        { code: 'hr.shift-definition', name: '人事-班次定义', type: 'PAGE', parentCode: 'hr' },
        { code: 'hr.schedule-entry', name: '人事-排班', type: 'PAGE', parentCode: 'hr' },
        { code: 'hr.commission-record', name: '人事-业绩提成', type: 'PAGE', parentCode: 'hr' },
        { code: 'hr.payroll-record', name: '人事-薪资单', type: 'PAGE', parentCode: 'hr' },
        { code: 'finance', name: '财务结算', type: 'MODULE' },
        { code: 'finance.customer-account', name: '财务结算-会员账户', type: 'PAGE', parentCode: 'finance' },
        { code: 'office', name: '办公审批', type: 'MODULE' },
        { code: 'office.leave-request', name: '办公审批-请假申请', type: 'PAGE', parentCode: 'office' },
        { code: 'office.expense-claim', name: '办公审批-报销申请', type: 'PAGE', parentCode: 'office' },
        { code: 'office.general-memo', name: '办公审批-日常签呈', type: 'PAGE', parentCode: 'office' },
        { code: 'logistics', name: '后勤管理', type: 'MODULE' },
        { code: 'logistics.vehicle', name: '后勤管理-车辆管理', type: 'PAGE', parentCode: 'logistics' },
        { code: 'logistics.vehicle-booking', name: '后勤管理-用车申请', type: 'PAGE', parentCode: 'logistics' },
        { code: 'logistics.utility-expense', name: '后勤管理-水电费登记', type: 'PAGE', parentCode: 'logistics' },
        { code: 'ai', name: 'AI助手', type: 'MODULE' },
        { code: 'ai.customer-service-agent', name: 'AI助手-智能客服', type: 'PAGE', parentCode: 'ai' },
        { code: 'ai.care-abnormality-agent', name: 'AI助手-护理异常建议', type: 'PAGE', parentCode: 'ai' },
        { code: 'ai.suggestion', name: 'AI助手-建议记录', type: 'PAGE', parentCode: 'ai' },
        { code: 'ai.knowledge-document', name: 'AI助手-知识库文档', type: 'PAGE', parentCode: 'ai' },
        { code: 'ai.business-analytics-agent', name: 'AI助手-经营分析解读', type: 'PAGE', parentCode: 'ai' },
        { code: 'integration', name: '系统集成', type: 'MODULE' },
        { code: 'integration.system', name: '系统集成-接入系统与服务项', type: 'PAGE', parentCode: 'integration' },
        { code: 'integration.binding', name: '系统集成-房间设备绑定', type: 'PAGE', parentCode: 'integration' },
        { code: 'iot', name: '设备网关', type: 'MODULE' },
        { code: 'iot.device-type', name: '设备网关-设备类型', type: 'PAGE', parentCode: 'iot' },
        { code: 'iot.device-registry', name: '设备网关-设备台账', type: 'PAGE', parentCode: 'iot' },
        { code: 'iot.device-event', name: '设备网关-事件与模拟', type: 'PAGE', parentCode: 'iot' },
        { code: 'analytics', name: '经营分析', type: 'MODULE' },
        { code: 'analytics.dashboard', name: '经营分析-看板', type: 'PAGE', parentCode: 'analytics' },
        { code: 'training', name: '培训与考核', type: 'MODULE' },
        { code: 'training.exam', name: '培训与考核-试卷管理', type: 'PAGE', parentCode: 'training' },
        { code: 'training.exam-attempt', name: '培训与考核-我的考试', type: 'PAGE', parentCode: 'training' },
    ];
    for (const sub of [
        'tenant',
        'region',
        'store',
        'department',
        'team',
        'position',
        'account',
        'role',
        'permission',
        'application',
        'tag',
        'parameter',
    ]) {
        for (const action of ['view', 'create', 'update', 'delete']) {
            permSpecs.push({
                code: `platform.${sub}.${action}`,
                name: `平台管理-${sub}-${action}`,
                type: 'BUTTON',
                parentCode: `platform.${sub}`,
            });
        }
    }
    for (const action of ['view', 'approve', 'reject', 'withdraw', 'reassign', 'add-approver', 'cc', 'archive']) {
        permSpecs.push({
            code: `workflow.instance.${action}`,
            name: `审批流程-实例-${action}`,
            type: 'BUTTON',
            parentCode: 'workflow.instance',
        });
    }
    for (const action of ['view', 'update']) {
        permSpecs.push({ code: `workflow.definition.${action}`, name: `审批流程-流程设置-${action}`, type: 'BUTTON', parentCode: 'workflow.definition' });
    }
    for (const action of ['view', 'create']) {
        permSpecs.push({
            code: `workflow.demo-approval.${action}`,
            name: `审批流程-示例审批单-${action}`,
            type: 'BUTTON',
            parentCode: 'workflow.demo-approval',
        });
    }
    permSpecs.push({ code: 'audit.log.view', name: '审计日志-查询-view', type: 'BUTTON', parentCode: 'audit.log' });
    for (const action of ['view', 'create', 'update', 'archive', 'delete', 'merge', 'force-delete', 'restore']) {
        permSpecs.push({ code: `crm.customer.${action}`, name: `CRM-客户-${action}`, type: 'BUTTON', parentCode: 'crm.customer' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `crm.channel.${action}`, name: `CRM-客户渠道-${action}`, type: 'BUTTON', parentCode: 'crm.channel' });
    }
    for (const action of ['view', 'create', 'update', 'assign', 'convert', 'lose']) {
        permSpecs.push({ code: `crm.lead.${action}`, name: `CRM-线索-${action}`, type: 'BUTTON', parentCode: 'crm.lead' });
    }
    for (const action of ['view', 'create', 'update', 'advance-stage', 'lose']) {
        permSpecs.push({ code: `crm.opportunity.${action}`, name: `CRM-销售机会-${action}`, type: 'BUTTON', parentCode: 'crm.opportunity' });
    }
    for (const action of ['view', 'create']) {
        permSpecs.push({ code: `crm.follow-up.${action}`, name: `CRM-跟进记录-${action}`, type: 'BUTTON', parentCode: 'crm.follow-up' });
    }
    for (const action of ['view', 'upload', 'update', 'confirm', 'void', 'delete']) {
        permSpecs.push({ code: `contract.record.${action}`, name: `合同管理-合同-${action}`, type: 'BUTTON', parentCode: 'contract.record' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `room.type.${action}`, name: `房态预订-房型-${action}`, type: 'BUTTON', parentCode: 'room.type' });
    }
    for (const action of ['view', 'create', 'update', 'maintenance', 'clean', 'delete', 'force-delete']) {
        permSpecs.push({ code: `room.room.${action}`, name: `房态预订-房间-${action}`, type: 'BUTTON', parentCode: 'room.room' });
    }
    for (const action of ['view', 'create', 'checkin', 'checkout', 'cancel', 'reschedule']) {
        permSpecs.push({ code: `room.occupancy.${action}`, name: `房态预订-占用记录-${action}`, type: 'BUTTON', parentCode: 'room.occupancy' });
    }
    for (const action of ['view', 'create', 'handle']) {
        permSpecs.push({ code: `room.call.${action}`, name: `房态预订-呼叫记录-${action}`, type: 'BUTTON', parentCode: 'room.call' });
    }
    for (const action of ['view', 'create', 'checkout', 'checkback', 'cancel']) {
        permSpecs.push({ code: `room.outing.${action}`, name: `房态预订-外出管理-${action}`, type: 'BUTTON', parentCode: 'room.outing' });
    }
    for (const action of ['view', 'create', 'fulfill']) {
        permSpecs.push({
            code: `room.service-requisition.${action}`,
            name: `房态预订-客房服务领用-${action}`,
            type: 'BUTTON',
            parentCode: 'room.service-requisition',
        });
    }
    for (const action of ['view', 'create', 'refund']) {
        permSpecs.push({ code: `payment.record.${action}`, name: `收款管理-收款-${action}`, type: 'BUTTON', parentCode: 'payment.record' });
    }
    for (const action of ['view', 'create', 'update', 'delete']) {
        permSpecs.push({ code: `care.field.${action}`, name: `护理-护理字段管理-${action}`, type: 'BUTTON', parentCode: 'care.field' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `care.form-template.${action}`, name: `护理-护理项目管理-${action}`, type: 'BUTTON', parentCode: 'care.form-template' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `care.plan-template.${action}`, name: `护理-护理方案管理-${action}`, type: 'BUTTON', parentCode: 'care.plan-template' });
    }
    for (const action of ['view']) {
        permSpecs.push({ code: `care.board.${action}`, name: `护理-护理看板-${action}`, type: 'BUTTON', parentCode: 'care.board' });
    }
    for (const action of ['view', 'create', 'update', 'force-delete', 'approve']) {
        permSpecs.push({ code: `care.profile.${action}`, name: `护理-母婴档案-${action}`, type: 'BUTTON', parentCode: 'care.profile' });
    }
    permSpecs.push({ code: 'care.growth.edit', name: '护理-生长曲线-修改数据', type: 'BUTTON', parentCode: 'care.growth' });
    for (const action of ['view', 'create', 'terminate']) {
        permSpecs.push({ code: `care.plan.${action}`, name: `护理-护理计划-${action}`, type: 'BUTTON', parentCode: 'care.plan' });
    }
    for (const action of ['view', 'create']) {
        permSpecs.push({ code: `care.record.${action}`, name: `护理-护理记录-${action}`, type: 'BUTTON', parentCode: 'care.record' });
    }
    for (const action of ['view', 'follow-up', 'resolve', 'ignore']) {
        permSpecs.push({ code: `care.abnormality.${action}`, name: `护理-护理异常-${action}`, type: 'BUTTON', parentCode: 'care.abnormality' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `care.outreach-template.${action}`, name: `护理-关怀模板管理-${action}`, type: 'BUTTON', parentCode: 'care.outreach-template' });
    }
    for (const action of ['view', 'create', 'terminate', 'complete-task']) {
        permSpecs.push({ code: `care.outreach-plan.${action}`, name: `护理-离店后关怀-${action}`, type: 'BUTTON', parentCode: 'care.outreach-plan' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `meal.item.${action}`, name: `月子餐-菜品管理-${action}`, type: 'BUTTON', parentCode: 'meal.item' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({
            code: `meal.dietary-restriction.${action}`,
            name: `月子餐-禁忌管理-${action}`,
            type: 'BUTTON',
            parentCode: 'meal.dietary-restriction',
        });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `meal.plan-template.${action}`, name: `月子餐-膳食计划管理-${action}`, type: 'BUTTON', parentCode: 'meal.plan-template' });
    }
    for (const action of ['view', 'create', 'end']) {
        permSpecs.push({ code: `meal.diner-profile.${action}`, name: `月子餐-用膳人-${action}`, type: 'BUTTON', parentCode: 'meal.diner-profile' });
    }
    for (const action of ['view', 'select', 'serve', 'feedback']) {
        permSpecs.push({ code: `meal.record.${action}`, name: `月子餐-排餐记录-${action}`, type: 'BUTTON', parentCode: 'meal.record' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `service.product.${action}`, name: `产康服务-项目-${action}`, type: 'BUTTON', parentCode: 'service.product' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `service.package.${action}`, name: `产康服务-服务包-${action}`, type: 'BUTTON', parentCode: 'service.package' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `service.therapist.${action}`, name: `产康服务-技师-${action}`, type: 'BUTTON', parentCode: 'service.therapist' });
    }
    for (const action of ['view', 'create']) {
        permSpecs.push({
            code: `service.customer-package.${action}`,
            name: `产康服务-客户已购服务包-${action}`,
            type: 'BUTTON',
            parentCode: 'service.customer-package',
        });
    }
    for (const action of ['view', 'create', 'complete', 'cancel', 'feedback']) {
        permSpecs.push({ code: `service.appointment.${action}`, name: `产康服务-预约-${action}`, type: 'BUTTON', parentCode: 'service.appointment' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `inventory.supplier.${action}`, name: `库存-供应商-${action}`, type: 'BUTTON', parentCode: 'inventory.supplier' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `inventory.warehouse.${action}`, name: `库存-仓库-${action}`, type: 'BUTTON', parentCode: 'inventory.warehouse' });
    }
    for (const action of ['view', 'create', 'update', 'delete']) {
        permSpecs.push({ code: `satisfaction.survey.${action}`, name: `满意度调查-调查记录-${action}`, type: 'BUTTON', parentCode: 'satisfaction.survey' });
    }
    for (const action of ['view', 'create', 'update', 'delete']) {
        permSpecs.push({ code: `satisfaction.template.${action}`, name: `满意度调查-模板-${action}`, type: 'BUTTON', parentCode: 'satisfaction.template' });
    }
    for (const action of ['view', 'create', 'update', 'delete', 'force-delete']) {
        permSpecs.push({ code: `inventory.item.${action}`, name: `库存-物品-${action}`, type: 'BUTTON', parentCode: 'inventory.item' });
    }
    permSpecs.push({ code: 'inventory.warehouse-stock.view', name: '库存-库存查询-view', type: 'BUTTON', parentCode: 'inventory.warehouse-stock' });
    permSpecs.push({ code: 'inventory.stock-batch.view', name: '库存-批次与效期-view', type: 'BUTTON', parentCode: 'inventory.stock-batch' });
    for (const action of ['view', 'create', 'update', 'submit', 'cancel', 'convert', 'collect']) {
        permSpecs.push({ code: `inventory.purchase-request.${action}`, name: `库存-申购单-${action}`, type: 'BUTTON', parentCode: 'inventory.purchase-request' });
    }
    for (const action of ['view', 'create', 'submit', 'cancel', 'purchase']) {
        permSpecs.push({ code: `inventory.purchase-order.${action}`, name: `库存-采购单-${action}`, type: 'BUTTON', parentCode: 'inventory.purchase-order' });
    }
    for (const action of ['view', 'create', 'submit', 'execute', 'cancel', 'receive']) {
        permSpecs.push({ code: `inventory.goods-receipt.${action}`, name: `库存-入库单-${action}`, type: 'BUTTON', parentCode: 'inventory.goods-receipt' });
    }
    for (const action of ['view', 'create', 'submit', 'execute', 'cancel']) {
        permSpecs.push({ code: `inventory.stock-issue.${action}`, name: `库存-出库/领用单-${action}`, type: 'BUTTON', parentCode: 'inventory.stock-issue' });
    }
    for (const action of ['view', 'create', 'submit', 'execute', 'cancel']) {
        permSpecs.push({ code: `inventory.stock-transfer.${action}`, name: `库存-调拨单-${action}`, type: 'BUTTON', parentCode: 'inventory.stock-transfer' });
    }
    for (const action of ['view', 'create', 'submit', 'execute', 'cancel']) {
        permSpecs.push({ code: `inventory.stock-count.${action}`, name: `库存-盘点单-${action}`, type: 'BUTTON', parentCode: 'inventory.stock-count' });
    }
    for (const action of ['view', 'create', 'update', 'change-no', 'archive', 'restore']) {
        permSpecs.push({ code: `hr.employee-profile.${action}`, name: `人事-员工档案-${action}`, type: 'BUTTON', parentCode: 'hr.employee-profile' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `hr.shift-definition.${action}`, name: `人事-班次定义-${action}`, type: 'BUTTON', parentCode: 'hr.shift-definition' });
    }
    for (const action of ['view', 'create', 'update', 'delete']) {
        permSpecs.push({ code: `hr.schedule-entry.${action}`, name: `人事-排班-${action}`, type: 'BUTTON', parentCode: 'hr.schedule-entry' });
    }
    for (const action of ['view', 'create', 'submit', 'cancel']) {
        permSpecs.push({ code: `hr.commission-record.${action}`, name: `人事-业绩提成-${action}`, type: 'BUTTON', parentCode: 'hr.commission-record' });
    }
    for (const action of ['view', 'view-all', 'create', 'submit', 'mark-paid', 'cancel']) {
        permSpecs.push({ code: `hr.payroll-record.${action}`, name: `人事-薪资单-${action}`, type: 'BUTTON', parentCode: 'hr.payroll-record' });
    }
    for (const action of ['view', 'recharge', 'consume', 'refund', 'adjust']) {
        permSpecs.push({ code: `finance.customer-account.${action}`, name: `财务结算-会员账户-${action}`, type: 'BUTTON', parentCode: 'finance.customer-account' });
    }
    for (const action of ['view', 'create', 'submit', 'cancel']) {
        permSpecs.push({ code: `office.leave-request.${action}`, name: `办公审批-请假申请-${action}`, type: 'BUTTON', parentCode: 'office.leave-request' });
    }
    for (const action of ['view', 'create', 'submit', 'cancel']) {
        permSpecs.push({ code: `office.expense-claim.${action}`, name: `办公审批-报销申请-${action}`, type: 'BUTTON', parentCode: 'office.expense-claim' });
    }
    for (const action of ['view', 'create', 'submit', 'cancel']) {
        permSpecs.push({ code: `office.general-memo.${action}`, name: `办公审批-日常签呈-${action}`, type: 'BUTTON', parentCode: 'office.general-memo' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `logistics.vehicle.${action}`, name: `后勤管理-车辆管理-${action}`, type: 'BUTTON', parentCode: 'logistics.vehicle' });
    }
    for (const action of ['view', 'create', 'cancel']) {
        permSpecs.push({ code: `logistics.vehicle-booking.${action}`, name: `后勤管理-用车申请-${action}`, type: 'BUTTON', parentCode: 'logistics.vehicle-booking' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `logistics.utility-expense.${action}`, name: `后勤管理-水电费登记-${action}`, type: 'BUTTON', parentCode: 'logistics.utility-expense' });
    }
    permSpecs.push({ code: 'ai.customer-service-agent.ask', name: 'AI助手-智能客服-ask', type: 'BUTTON', parentCode: 'ai.customer-service-agent' });
    permSpecs.push({ code: 'ai.care-abnormality-agent.suggest', name: 'AI助手-护理异常建议-suggest', type: 'BUTTON', parentCode: 'ai.care-abnormality-agent' });
    for (const action of ['view', 'accept', 'dismiss']) {
        permSpecs.push({ code: `ai.suggestion.${action}`, name: `AI助手-建议记录-${action}`, type: 'BUTTON', parentCode: 'ai.suggestion' });
    }
    for (const action of ['view', 'create', 'update', 'delete']) {
        permSpecs.push({ code: `ai.knowledge-document.${action}`, name: `AI助手-知识库文档-${action}`, type: 'BUTTON', parentCode: 'ai.knowledge-document' });
    }
    permSpecs.push({ code: 'ai.business-analytics-agent.analyze', name: 'AI助手-经营分析解读-analyze', type: 'BUTTON', parentCode: 'ai.business-analytics-agent' });
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `integration.system.${action}`, name: `系统集成-接入系统-${action}`, type: 'BUTTON', parentCode: 'integration.system' });
    }
    for (const action of ['view', 'update']) {
        permSpecs.push({ code: `integration.binding.${action}`, name: `系统集成-房间设备绑定-${action}`, type: 'BUTTON', parentCode: 'integration.binding' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `iot.device-type.${action}`, name: `设备网关-设备类型-${action}`, type: 'BUTTON', parentCode: 'iot.device-type' });
    }
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `iot.device-registry.${action}`, name: `设备网关-设备台账-${action}`, type: 'BUTTON', parentCode: 'iot.device-registry' });
    }
    for (const action of ['view', 'simulate', 'issue-command', 'confirm-command']) {
        permSpecs.push({ code: `iot.device-event.${action}`, name: `设备网关-事件与模拟-${action}`, type: 'BUTTON', parentCode: 'iot.device-event' });
    }
    permSpecs.push({ code: 'analytics.dashboard.view', name: '经营分析-看板-view', type: 'BUTTON', parentCode: 'analytics.dashboard' });
    for (const action of ['view', 'create', 'update']) {
        permSpecs.push({ code: `training.exam.${action}`, name: `培训与考核-试卷管理-${action}`, type: 'BUTTON', parentCode: 'training.exam' });
    }
    for (const action of ['view', 'submit', 'grade']) {
        permSpecs.push({ code: `training.exam-attempt.${action}`, name: `培训与考核-我的考试-${action}`, type: 'BUTTON', parentCode: 'training.exam-attempt' });
    }
    const codeToId = new Map();
    for (const spec of permSpecs.filter((p) => p.type === 'MODULE')) {
        const created = await prisma.permissionPoint.upsert({
            where: { code: spec.code },
            update: {},
            create: {
                code: spec.code,
                name: spec.name,
                type: spec.type,
                applicationId: application.id,
                isSensitive: spec.isSensitive ?? false,
            },
        });
        codeToId.set(spec.code, created.id);
    }
    for (const spec of permSpecs.filter((p) => p.type === 'PAGE')) {
        const created = await prisma.permissionPoint.upsert({
            where: { code: spec.code },
            update: {},
            create: {
                code: spec.code,
                name: spec.name,
                type: spec.type,
                parentId: spec.parentCode ? codeToId.get(spec.parentCode) : undefined,
                applicationId: application.id,
                isSensitive: spec.isSensitive ?? false,
            },
        });
        codeToId.set(spec.code, created.id);
    }
    for (const spec of permSpecs.filter((p) => p.type === 'BUTTON' || p.type === 'FIELD')) {
        const created = await prisma.permissionPoint.upsert({
            where: { code: spec.code },
            update: {},
            create: {
                code: spec.code,
                name: spec.name,
                type: spec.type,
                parentId: spec.parentCode ? codeToId.get(spec.parentCode) : undefined,
                applicationId: application.id,
                isSensitive: spec.isSensitive ?? false,
            },
        });
        codeToId.set(spec.code, created.id);
    }
    console.log(`权限点目录：共 ${codeToId.size} 条`);
    const superAdminRole = await prisma.role.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: 'SUPER_ADMIN' } },
        update: {},
        create: {
            tenantId: tenant.id,
            code: 'SUPER_ADMIN',
            name: '超级管理员',
            description: '拥有全部权限的内置系统角色',
            isSystem: true,
            createdBy: 'SEED',
        },
    });
    const defaultRoleByCode = new Map();
    for (const r of role_defaults_1.DEFAULT_ROLES) {
        const role = await prisma.role.upsert({
            where: { tenantId_code: { tenantId: tenant.id, code: r.code } },
            update: {},
            create: { tenantId: tenant.id, code: r.code, name: r.name, description: r.description, createdBy: 'SEED' },
        });
        defaultRoleByCode.set(r.code, role);
    }
    const storeManagerRole = defaultRoleByCode.get('STORE_MANAGER');
    const storeStaffRole = defaultRoleByCode.get('STORE_STAFF');
    for (const permissionPointId of codeToId.values()) {
        await prisma.roleOnPermission
            .upsert({
            where: { roleId_permissionPointId: { roleId: superAdminRole.id, permissionPointId } },
            update: {},
            create: { roleId: superAdminRole.id, permissionPointId, createdBy: 'SEED' },
        })
            .catch(() => undefined);
    }
    const allPermissionCodes = permSpecs.map((p) => p.code);
    for (const r of role_defaults_1.DEFAULT_ROLES) {
        const role = defaultRoleByCode.get(r.code);
        for (const code of (0, role_defaults_1.resolveDefaultCodes)(r.code, allPermissionCodes) ?? []) {
            const permissionPointId = codeToId.get(code);
            if (!permissionPointId)
                continue;
            await prisma.roleOnPermission
                .upsert({
                where: { roleId_permissionPointId: { roleId: role.id, permissionPointId } },
                update: {},
                create: { roleId: role.id, permissionPointId, createdBy: 'SEED' },
            })
                .catch(() => undefined);
        }
    }
    const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const adminAccount = await prisma.account.upsert({
        where: { tenantId_username: { tenantId: tenant.id, username: ADMIN_USERNAME } },
        update: {},
        create: {
            tenantId: tenant.id,
            storeId: store.id,
            departmentId: department.id,
            teamId: team.id,
            positionId: position.id,
            username: ADMIN_USERNAME,
            realName: '超级管理员',
            phone: '13800000000',
            passwordHash: adminPasswordHash,
            createdBy: 'SEED',
        },
    });
    await prisma.accountRoleAssignment.upsert({
        where: { id: `seed-admin-${superAdminRole.id}` },
        update: {},
        create: {
            id: `seed-admin-${superAdminRole.id}`,
            tenantId: tenant.id,
            accountId: adminAccount.id,
            roleId: superAdminRole.id,
            scopeType: 'TENANT',
            grantedBy: 'SEED',
        },
    });
    const customerClassificationTags = ['A', 'B', 'C', 'D', 'E'];
    const customerTypeTags = ['鹰派', '萌派', '洋派', '狐派', '驴派', '变色龙'];
    for (const name of customerClassificationTags) {
        await prisma.tag.upsert({
            where: { tenantId_name: { tenantId: tenant.id, name: `客户分类-${name}` } },
            update: {},
            create: { tenantId: tenant.id, name: `客户分类-${name}`, category: 'CUSTOMER_CLASSIFICATION', createdBy: 'SEED' },
        });
    }
    for (const name of customerTypeTags) {
        await prisma.tag.upsert({
            where: { tenantId_name: { tenantId: tenant.id, name } },
            update: {},
            create: { tenantId: tenant.id, name, category: 'CUSTOMER_TYPE', createdBy: 'SEED' },
        });
    }
    const careRiskTags = ['早产', '传染病', '高敏', '妈咪住院'];
    for (const name of careRiskTags) {
        await prisma.tag.upsert({
            where: { tenantId_name: { tenantId: tenant.id, name } },
            update: {},
            create: { tenantId: tenant.id, name, category: 'CARE_RISK', createdBy: 'SEED' },
        });
    }
    let storeManagerAccount;
    if (!isProduction) {
        const demoPasswordHash = await bcrypt.hash(SEED_PASSWORD, 10);
        storeManagerAccount = await prisma.account.upsert({
            where: { tenantId_username: { tenantId: tenant.id, username: 'store_manager' } },
            update: {},
            create: {
                tenantId: tenant.id,
                storeId: store.id,
                departmentId: department.id,
                teamId: team.id,
                positionId: position.id,
                username: 'store_manager',
                realName: '示例店店长',
                phone: '13900000000',
                passwordHash: demoPasswordHash,
                createdBy: 'SEED',
            },
        });
        await prisma.accountRoleAssignment.upsert({
            where: { id: `seed-storemgr-${storeManagerRole.id}` },
            update: {},
            create: {
                id: `seed-storemgr-${storeManagerRole.id}`,
                tenantId: tenant.id,
                accountId: storeManagerAccount.id,
                roleId: storeManagerRole.id,
                scopeType: 'STORE',
                scopeId: store.id,
                grantedBy: 'SEED',
            },
        });
        const storeStaffPasswordHash = await bcrypt.hash(SEED_PASSWORD, 10);
        const storeStaffAccount = await prisma.account.upsert({
            where: { tenantId_username: { tenantId: tenant.id, username: 'store_staff' } },
            update: {},
            create: {
                tenantId: tenant.id,
                storeId: store.id,
                departmentId: department.id,
                teamId: team.id,
                positionId: position.id,
                username: 'store_staff',
                realName: '示例店前台',
                phone: '13900000002',
                passwordHash: storeStaffPasswordHash,
                createdBy: 'SEED',
            },
        });
        await prisma.accountRoleAssignment.upsert({
            where: { id: `seed-storestaff-${storeStaffRole.id}` },
            update: {},
            create: {
                id: `seed-storestaff-${storeStaffRole.id}`,
                tenantId: tenant.id,
                accountId: storeStaffAccount.id,
                roleId: storeStaffRole.id,
                scopeType: 'STORE',
                scopeId: store.id,
                grantedBy: 'SEED',
            },
        });
        const secondStore = await prisma.store.upsert({
            where: { tenantId_code: { tenantId: tenant.id, code: `${STORE_CODE}2` } },
            update: {},
            create: {
                tenantId: tenant.id,
                regionId: region.id,
                code: `${STORE_CODE}2`,
                name: '伴月轩·测试店',
                status: 'ACTIVE',
                createdBy: 'SEED',
            },
        });
        const testUserAccount = await prisma.account.upsert({
            where: { tenantId_username: { tenantId: tenant.id, username: 'test_user' } },
            update: {},
            create: {
                tenantId: tenant.id,
                storeId: secondStore.id,
                departmentId: department.id,
                teamId: team.id,
                positionId: position.id,
                username: 'test_user',
                realName: '测试店店长',
                phone: '13900000001',
                passwordHash: demoPasswordHash,
                createdBy: 'SEED',
            },
        });
        await prisma.accountRoleAssignment.upsert({
            where: { id: `seed-testuser-${storeManagerRole.id}` },
            update: {},
            create: {
                id: `seed-testuser-${storeManagerRole.id}`,
                tenantId: tenant.id,
                accountId: testUserAccount.id,
                roleId: storeManagerRole.id,
                scopeType: 'STORE',
                scopeId: secondStore.id,
                grantedBy: 'SEED',
            },
        });
    }
    const workflowDefinition = await prisma.workflowDefinition.upsert({
        where: { tenantId_code_version: { tenantId: tenant.id, code: 'DEMO_APPROVAL', version: 1 } },
        update: {},
        create: {
            tenantId: tenant.id,
            code: 'DEMO_APPROVAL',
            name: '示例审批单',
            version: 1,
            status: 'PUBLISHED',
            createdBy: 'SEED',
        },
    });
    await prisma.workflowNode.upsert({
        where: { workflowDefinitionId_seq: { workflowDefinitionId: workflowDefinition.id, seq: 1 } },
        update: {},
        create: {
            workflowDefinitionId: workflowDefinition.id,
            seq: 1,
            name: '店长初审',
            approverType: 'ROLE',
            approverRoleId: storeManagerRole.id,
        },
    });
    await prisma.workflowNode.upsert({
        where: { workflowDefinitionId_seq: { workflowDefinitionId: workflowDefinition.id, seq: 2 } },
        update: {},
        create: {
            workflowDefinitionId: workflowDefinition.id,
            seq: 2,
            name: '平台管理员终审',
            approverType: 'ROLE',
            approverRoleId: superAdminRole.id,
        },
    });
    const contractSigningDefinition = await prisma.workflowDefinition.upsert({
        where: { tenantId_code_version: { tenantId: tenant.id, code: 'CONTRACT_SIGNING', version: 1 } },
        update: {},
        create: {
            tenantId: tenant.id,
            code: 'CONTRACT_SIGNING',
            name: '合同签约审核',
            version: 1,
            status: 'PUBLISHED',
            createdBy: 'SEED',
        },
    });
    await prisma.workflowNode.upsert({
        where: { workflowDefinitionId_seq: { workflowDefinitionId: contractSigningDefinition.id, seq: 1 } },
        update: {},
        create: {
            workflowDefinitionId: contractSigningDefinition.id,
            seq: 1,
            name: '店长初审',
            approverType: 'ROLE',
            approverRoleId: storeManagerRole.id,
        },
    });
    await prisma.workflowNode.upsert({
        where: { workflowDefinitionId_seq: { workflowDefinitionId: contractSigningDefinition.id, seq: 2 } },
        update: {},
        create: {
            workflowDefinitionId: contractSigningDefinition.id,
            seq: 2,
            name: '平台管理员终审',
            approverType: 'ROLE',
            approverRoleId: superAdminRole.id,
        },
    });
    const paymentRefundDefinition = await prisma.workflowDefinition.upsert({
        where: { tenantId_code_version: { tenantId: tenant.id, code: 'PAYMENT_REFUND', version: 1 } },
        update: {},
        create: {
            tenantId: tenant.id,
            code: 'PAYMENT_REFUND',
            name: '收款退款审批',
            version: 1,
            status: 'PUBLISHED',
            createdBy: 'SEED',
        },
    });
    await prisma.workflowNode.upsert({
        where: { workflowDefinitionId_seq: { workflowDefinitionId: paymentRefundDefinition.id, seq: 1 } },
        update: {},
        create: {
            workflowDefinitionId: paymentRefundDefinition.id,
            seq: 1,
            name: '店长审批',
            approverType: 'ROLE',
            approverRoleId: storeManagerRole.id,
        },
    });
    const inventoryWorkflowDefs = [
        { code: 'INVENTORY_PURCHASE_REQUEST', name: '申购单审批' },
        { code: 'INVENTORY_PURCHASE', name: '采购单审批' },
        { code: 'INVENTORY_GOODS_RECEIPT', name: '入库单审批' },
        { code: 'INVENTORY_STOCK_ISSUE', name: '出库/领用单审批' },
        { code: 'INVENTORY_STOCK_TRANSFER', name: '调拨单审批' },
        { code: 'INVENTORY_STOCK_COUNT', name: '盘点单盈亏审批' },
    ];
    for (const def of inventoryWorkflowDefs) {
        const definition = await prisma.workflowDefinition.upsert({
            where: { tenantId_code_version: { tenantId: tenant.id, code: def.code, version: 1 } },
            update: {},
            create: { tenantId: tenant.id, code: def.code, name: def.name, version: 1, status: 'PUBLISHED', createdBy: 'SEED' },
        });
        await prisma.workflowNode.upsert({
            where: { workflowDefinitionId_seq: { workflowDefinitionId: definition.id, seq: 1 } },
            update: {},
            create: { workflowDefinitionId: definition.id, seq: 1, name: '店长审批', approverType: 'ROLE', approverRoleId: storeManagerRole.id },
        });
    }
    const commissionDefinition = await prisma.workflowDefinition.upsert({
        where: { tenantId_code_version: { tenantId: tenant.id, code: 'HR_COMMISSION', version: 1 } },
        update: {},
        create: { tenantId: tenant.id, code: 'HR_COMMISSION', name: '业绩提成审批', version: 1, status: 'PUBLISHED', createdBy: 'SEED' },
    });
    await prisma.workflowNode.upsert({
        where: { workflowDefinitionId_seq: { workflowDefinitionId: commissionDefinition.id, seq: 1 } },
        update: {},
        create: { workflowDefinitionId: commissionDefinition.id, seq: 1, name: '店长审批', approverType: 'ROLE', approverRoleId: storeManagerRole.id },
    });
    const payrollDefinition = await prisma.workflowDefinition.upsert({
        where: { tenantId_code_version: { tenantId: tenant.id, code: 'HR_PAYROLL', version: 1 } },
        update: {},
        create: { tenantId: tenant.id, code: 'HR_PAYROLL', name: '薪资单审批', version: 1, status: 'PUBLISHED', createdBy: 'SEED' },
    });
    await prisma.workflowNode.upsert({
        where: { workflowDefinitionId_seq: { workflowDefinitionId: payrollDefinition.id, seq: 1 } },
        update: {},
        create: { workflowDefinitionId: payrollDefinition.id, seq: 1, name: '店长初审', approverType: 'ROLE', approverRoleId: storeManagerRole.id },
    });
    await prisma.workflowNode.upsert({
        where: { workflowDefinitionId_seq: { workflowDefinitionId: payrollDefinition.id, seq: 2 } },
        update: {},
        create: { workflowDefinitionId: payrollDefinition.id, seq: 2, name: '平台管理员终审', approverType: 'ROLE', approverRoleId: superAdminRole.id },
    });
    const officeDefinitions = [
        { code: 'OFFICE_LEAVE', name: '请假申请审批' },
        { code: 'OFFICE_EXPENSE', name: '报销申请审批' },
        { code: 'OFFICE_MEMO', name: '日常签呈审批' },
    ];
    for (const { code, name } of officeDefinitions) {
        const definition = await prisma.workflowDefinition.upsert({
            where: { tenantId_code_version: { tenantId: tenant.id, code, version: 1 } },
            update: {},
            create: { tenantId: tenant.id, code, name, version: 1, status: 'PUBLISHED', createdBy: 'SEED' },
        });
        await prisma.workflowNode.upsert({
            where: { workflowDefinitionId_seq: { workflowDefinitionId: definition.id, seq: 1 } },
            update: {},
            create: { workflowDefinitionId: definition.id, seq: 1, name: '店长审批', approverType: 'ROLE', approverRoleId: storeManagerRole.id },
        });
    }
    const parameters = [
        { key: 'platform.password_policy.min_length', value: '8', description: '密码最小长度' },
        { key: 'platform.session.access_token_ttl_minutes', value: '30', description: 'Access Token 有效期（分钟）' },
        { key: 'platform.session.refresh_token_ttl_days', value: '14', description: 'Refresh Token 有效期（天）' },
        { key: 'workflow.archive_delay_seconds', value: '60', description: '工作流通过后自动归档延迟秒数' },
        { key: 'room.turnover_buffer_days', value: '1', description: '房间整理间隔（天）：上一位离店后至少隔这么多天，下一位才能入住；不够会进“预订冲突”清单' },
    ];
    for (const p of parameters) {
        const existing = await prisma.parameter.findFirst({
            where: { tenantId: tenant.id, storeId: null, key: p.key },
        });
        if (!existing) {
            await prisma.parameter.create({
                data: { tenantId: tenant.id, storeId: null, key: p.key, value: p.value, description: p.description, isSystem: true, createdBy: 'SEED' },
            });
        }
    }
    if (!isProduction) {
        const tag = await prisma.tag.upsert({
            where: { tenantId_name: { tenantId: tenant.id, name: '示例标签' } },
            update: {},
            create: { tenantId: tenant.id, name: '示例标签', color: '#1f3a5f', createdBy: 'SEED' },
        });
        const existingStoreTagBinding = await prisma.tagBinding.findFirst({
            where: { tagId: tag.id, entityType: 'Store', entityId: store.id, revokedAt: null },
        });
        if (!existingStoreTagBinding) {
            await prisma.tagBinding.create({
                data: { tenantId: tenant.id, tagId: tag.id, entityType: 'Store', entityId: store.id, createdBy: 'SEED' },
            });
        }
        const demoLead = await prisma.lead.findFirst({
            where: { tenantId: tenant.id, phone: '13700000001' },
        });
        if (!demoLead) {
            await prisma.lead.create({
                data: {
                    tenantId: tenant.id,
                    leadNo: (0, business_no_util_1.generateBusinessNo)('L'),
                    name: '示例线索-张女士',
                    phone: '13700000001',
                    source: 'ONLINE_AD',
                    storeId: store.id,
                    status: 'NEW',
                    createdBy: 'SEED',
                },
            });
        }
        let demoCustomer = await prisma.customer.findFirst({
            where: { tenantId: tenant.id, phone: '13700000002' },
        });
        if (!demoCustomer) {
            demoCustomer = await prisma.customer.create({
                data: {
                    tenantId: tenant.id,
                    customerNo: (0, business_no_util_1.generateBusinessNo)('C'),
                    name: '示例客户-李女士',
                    phone: '13700000002',
                    source: 'REFERRAL',
                    primaryStoreId: store.id,
                    assignedToId: storeManagerAccount.id,
                    createdBy: 'SEED',
                },
            });
        }
        const demoOpportunity = await prisma.salesOpportunity.findFirst({
            where: { tenantId: tenant.id, customerId: demoCustomer.id },
        });
        if (!demoOpportunity) {
            await prisma.salesOpportunity.create({
                data: {
                    tenantId: tenant.id,
                    opportunityNo: (0, business_no_util_1.generateBusinessNo)('O'),
                    customerId: demoCustomer.id,
                    stage: 'FOLLOWING',
                    assignedToId: storeManagerAccount.id,
                    createdBy: 'SEED',
                },
            });
        }
        let demoContract = await prisma.contract.findFirst({
            where: { tenantId: tenant.id, customerId: demoCustomer.id },
        });
        if (!demoContract) {
            demoContract = await prisma.contract.create({
                data: {
                    tenantId: tenant.id,
                    contractNo: (0, business_no_util_1.generateBusinessNo)('CT'),
                    customerId: demoCustomer.id,
                    storeId: store.id,
                    title: '示例客户-李女士 月子套餐合同',
                    paperNo: 'DEMO-0001',
                    signedDate: new Date(),
                    clientName: '示例客户-李女士',
                    clientPhone: '13800000001',
                    careMode: 'ONE_TO_ONE',
                    inHouseDays: 28,
                    amount: 8800000,
                    status: 'ACTIVE',
                    confirmedAt: new Date(),
                    createdBy: 'SEED',
                },
            });
        }
        const standardRoomType = await prisma.roomType.upsert({
            where: { tenantId_code: { tenantId: tenant.id, code: 'STANDARD' } },
            update: {},
            create: {
                tenantId: tenant.id,
                code: 'STANDARD',
                name: '标准房',
                standardPrice: 60000,
                createdBy: 'SEED',
            },
        });
        const suiteRoomType = await prisma.roomType.upsert({
            where: { tenantId_code: { tenantId: tenant.id, code: 'SUITE' } },
            update: {},
            create: {
                tenantId: tenant.id,
                code: 'SUITE',
                name: '套房',
                standardPrice: 98000,
                createdBy: 'SEED',
            },
        });
        const roomSeeds = [
            { roomNo: '201', floor: '2F', roomTypeId: standardRoomType.id },
            { roomNo: '202', floor: '2F', roomTypeId: standardRoomType.id },
            { roomNo: '301', floor: '3F', roomTypeId: suiteRoomType.id },
        ];
        const demoRooms = [];
        for (const r of roomSeeds) {
            const room = await prisma.room.upsert({
                where: { tenantId_storeId_roomNo: { tenantId: tenant.id, storeId: store.id, roomNo: r.roomNo } },
                update: {},
                create: {
                    tenantId: tenant.id,
                    storeId: store.id,
                    roomTypeId: r.roomTypeId,
                    roomNo: r.roomNo,
                    floor: r.floor,
                    createdBy: 'SEED',
                },
            });
            demoRooms.push(room);
        }
        const demoOccupancy = await prisma.roomOccupancy.findFirst({
            where: { tenantId: tenant.id, customerId: demoCustomer.id },
        });
        if (!demoOccupancy) {
            await prisma.roomOccupancy.create({
                data: {
                    tenantId: tenant.id,
                    occupancyNo: (0, business_no_util_1.generateBusinessNo)('RO'),
                    roomId: demoRooms[0].id,
                    storeId: store.id,
                    customerId: demoCustomer.id,
                    plannedCheckIn: new Date(),
                    plannedCheckOut: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    status: 'RESERVED',
                    createdBy: 'SEED',
                },
            });
        }
        const demoPayment = await prisma.payment.findFirst({
            where: { tenantId: tenant.id, contractId: demoContract.id },
        });
        if (!demoPayment) {
            await prisma.payment.create({
                data: {
                    tenantId: tenant.id,
                    paymentNo: (0, business_no_util_1.generateBusinessNo)('PY'),
                    contractId: demoContract.id,
                    customerId: demoCustomer.id,
                    storeId: store.id,
                    amount: 3000000,
                    method: 'CASH',
                    status: 'RECORDED',
                    createdBy: 'SEED',
                },
            });
        }
    }
    console.log('seed 完成:');
    console.log(`  租户: ${tenant.code} / 门店: ${store.code} / 区域: ${region.code}`);
    if (isProduction) {
        console.log(`  账号: ${ADMIN_USERNAME}（密码为 SEED_ADMIN_PASSWORD 指定的值，请勿在日志/文档中记录明文）`);
    }
    else {
        console.log(`  账号: ${ADMIN_USERNAME} / store_manager / store_staff（密码见 SEED_DEV_PASSWORD，默认 ${SEED_PASSWORD}）`);
    }
    console.log(`  工作流定义: DEMO_APPROVAL/HR_PAYROLL（店长初审 -> 平台管理员终审）、PAYMENT_REFUND + 库存五单据 + HR_COMMISSION（均为店长审批）`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map