"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dec = exports.MED_TIME_LABEL = exports.MED_ROUTE_LABEL = exports.MED_AI_DESCRIPTION = exports.MED_ITEM_COLUMNS = exports.MED_HEADER_FIELDS = void 0;
const assessment_specs_1 = require("../care-assessment/assessment-specs");
Object.defineProperty(exports, "dec", { enumerable: true, get: function () { return assessment_specs_1.dec; } });
exports.MED_HEADER_FIELDS = [
    (0, assessment_specs_1.date)('authDate', '委托日期'),
    (0, assessment_specs_1.date)('medicationStart', '用药日期', { aiHint: '“用药日期”后手写的日期；年份缺省按今年补全' }),
    (0, assessment_specs_1.text)('signerName', '宝妈或家属签字', { aiHint: '底部“宝妈或家属（签字）”处的手写姓名；字迹难辨尽力辨认' }),
    (0, assessment_specs_1.text)('nurseName', '护理师签字', { aiHint: '底部“护理师（签字）”处的手写姓名' }),
    (0, assessment_specs_1.longtext)('remark', '备注'),
];
exports.MED_ITEM_COLUMNS = [
    (0, assessment_specs_1.text)('drugName', '药名', { aiHint: '“药名”栏手写的药品名称，常是简称或字母（如 AD、D3）；原样抄写' }),
    (0, assessment_specs_1.single)('route', '用法', [(0, assessment_specs_1.o)('ORAL', '内服'), (0, assessment_specs_1.o)('EXTERNAL', '外用')], { aiHint: '“用法”栏下“内服/外用”两列，打勾的那一列' }),
    (0, assessment_specs_1.multi)('times', '服药时间', [(0, assessment_specs_1.o)('MORNING', '早'), (0, assessment_specs_1.o)('NOON', '中'), (0, assessment_specs_1.o)('EVENING', '晚')], { aiHint: '“服药时间”栏下“早/中/晚”三列，打勾的列（可多选）' }),
    (0, assessment_specs_1.text)('dose', '剂量', { aiHint: '纸质表上一般没有这一栏，读不到就填 null，不要猜' }),
    (0, assessment_specs_1.int)('courseDays', '疗程(天)', { min: 1, max: 90, aiHint: '纸质表上一般没有，读不到就填 null' }),
    (0, assessment_specs_1.date)('startDate', '开始日期'),
    (0, assessment_specs_1.date)('endDate', '结束日期'),
    (0, assessment_specs_1.text)('notes', '用药注意事项', { aiHint: '“用药注意事项”栏手写内容，如饭前饭后、间隔时长' }),
    (0, assessment_specs_1.single)('familySigned', '家长签名', [(0, assessment_specs_1.o)('YES', '已签')], { aiHint: '该行“家长签名”栏有签名就填 YES，没有填 null' }),
];
exports.MED_AI_DESCRIPTION = '《新生儿用药服药喂药委托书》：家长委托护理师给宝宝服药。上方是妈妈姓名、房间号、用药日期、委托日期（手写），中间是药品表格（药名、用法内服/外用、服药时间早/中/晚、用药注意事项、家长签名，多行，没写的行是空行），' +
    '底部是宝妈或家属签字、护理师签字。印刷表格，手写和打钩。';
exports.MED_ROUTE_LABEL = { ORAL: '内服', EXTERNAL: '外用' };
exports.MED_TIME_LABEL = { MORNING: '早', NOON: '中', EVENING: '晚' };
//# sourceMappingURL=medication-specs.js.map