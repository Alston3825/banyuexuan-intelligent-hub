"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Kuaidi100Client_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kuaidi100Client = exports.EXPRESS_COMPANIES = exports.LOGISTICS_FINAL_STATES = exports.LOGISTICS_STATE_LABEL = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
exports.LOGISTICS_STATE_LABEL = {
    [-1]: '暂无物流信息',
    0: '运输中',
    1: '已揽收',
    2: '疑难件',
    3: '已签收',
    4: '已退签',
    5: '派件中',
    6: '退回中',
    7: '转投中',
    8: '清关中',
    14: '已拒签',
};
exports.LOGISTICS_FINAL_STATES = [3, 4, 6, 14];
exports.EXPRESS_COMPANIES = [
    { code: 'yuantong', name: '圆通' },
    { code: 'zhongtong', name: '中通' },
    { code: 'zhongtongkuaiyun', name: '中通快运' },
    { code: 'shentong', name: '申通' },
    { code: 'yunda', name: '韵达' },
    { code: 'jtexpress', name: '极兔' },
    { code: 'shunfeng', name: '顺丰（需填手机尾号）' },
    { code: 'youzhengguonei', name: '邮政包裹' },
    { code: 'ems', name: 'EMS' },
    { code: 'jd', name: '京东' },
    { code: 'debangwuliu', name: '德邦' },
    { code: 'huitongkuaidi', name: '百世' },
    { code: 'youshuwuliu', name: '优速' },
    { code: 'annengwuliu', name: '安能' },
    { code: 'kuayue', name: '跨越' },
    { code: 'zhaijisong', name: '宅急送' },
];
let Kuaidi100Client = Kuaidi100Client_1 = class Kuaidi100Client {
    logger = new common_1.Logger(Kuaidi100Client_1.name);
    url = process.env.KUAIDI100_URL || 'https://poll.kuaidi100.com/poll/query.do';
    isConfigured() {
        return !!process.env.KUAIDI100_CUSTOMER && !!process.env.KUAIDI100_KEY;
    }
    async query(company, num, phoneTail) {
        const customer = process.env.KUAIDI100_CUSTOMER;
        const key = process.env.KUAIDI100_KEY;
        if (!customer || !key)
            throw new common_1.ServiceUnavailableException('还没有配置快递100的密钥（KUAIDI100_CUSTOMER / KUAIDI100_KEY），请联系管理员');
        const param = JSON.stringify({ com: company, num, phone: phoneTail ?? '', resultv2: '0', show: '0', order: 'desc' });
        const sign = (0, crypto_1.createHash)('md5').update(param + key + customer).digest('hex').toUpperCase();
        let body;
        try {
            const res = await fetch(this.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ customer, sign, param }).toString(),
                signal: AbortSignal.timeout(15_000),
            });
            body = (await res.json());
        }
        catch (e) {
            this.logger.warn(`快递100 请求失败：${e.message}`);
            throw new common_1.ServiceUnavailableException('快递100 暂时连不上，稍后再试');
        }
        if (body.result === false && String(body.returnCode) === '500' && /无结果/.test(String(body.message ?? ''))) {
            return { state: -1, events: [], company, num };
        }
        if (body.result === false || (body.status !== undefined && String(body.status) !== '200')) {
            throw new common_1.ServiceUnavailableException(`快递100：${String(body.message ?? '查询失败')}`);
        }
        const data = Array.isArray(body.data) ? body.data : [];
        return {
            state: Number(body.state ?? 0),
            company: String(body.com ?? company),
            num: String(body.nu ?? num),
            events: data.map((d) => ({ time: String(d.time ?? d.ftime ?? ''), context: String(d.context ?? ''), location: d.location ? String(d.location) : undefined })),
        };
    }
};
exports.Kuaidi100Client = Kuaidi100Client;
exports.Kuaidi100Client = Kuaidi100Client = Kuaidi100Client_1 = __decorate([
    (0, common_1.Injectable)()
], Kuaidi100Client);
//# sourceMappingURL=kuaidi100.client.js.map