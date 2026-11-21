"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.columnName = exports.DAILY_BABY_AI_DESCRIPTION = exports.DAILY_AI_DESCRIPTION = exports.dailyFlatFields = exports.NURSING_COLUMNS = exports.FEEDING_COLUMNS = exports.DAILY_BABY_FIELDS = exports.DAILY_MOTHER_FIELDS = void 0;
const assessment_specs_1 = require("../care-assessment/assessment-specs");
Object.defineProperty(exports, "columnName", { enumerable: true, get: function () { return assessment_specs_1.columnName; } });
const DAILY_LOCHIA_COLOR = [(0, assessment_specs_1.o)('BRIGHT_RED', '鲜红'), (0, assessment_specs_1.o)('PINK', '粉红'), (0, assessment_specs_1.o)('DARK_RED', '暗红'), (0, assessment_specs_1.o)('BROWN', '褐色')];
const SIGN_HINT = '体征各行的读法：只有被【圈出来 / 打了勾】的词才选中（=有异常）；被一条斜线或横线【划掉】的词表示“没有这个情况”，绝对不能选中；整行都没有圈出或打勾的，输出空数组 []。不要因为某个词旁边有笔迹就选它，要看笔迹是“圈/勾”还是“划掉”。';
const MILK = [(0, assessment_specs_1.o)('LITTLE', '少'), (0, assessment_specs_1.o)('MEDIUM', '适中'), (0, assessment_specs_1.o)('MUCH', '多')];
const STOOL_COLOR = [(0, assessment_specs_1.o)('YELLOW', '黄'), (0, assessment_specs_1.o)('GREEN', '绿'), (0, assessment_specs_1.o)('DARK_GREEN', '墨绿'), (0, assessment_specs_1.o)('BROWN', '褐'), (0, assessment_specs_1.o)('WHITE', '白陶土色'), (0, assessment_specs_1.o)('RED', '带血')];
const STOOL_AMOUNT = [(0, assessment_specs_1.o)('DOT', '点'), (0, assessment_specs_1.o)('LITTLE', '少'), (0, assessment_specs_1.o)('MEDIUM', '中'), (0, assessment_specs_1.o)('MUCH', '多')];
const STOOL_TEXTURE = [(0, assessment_specs_1.o)('PASTE', '糊状'), (0, assessment_specs_1.o)('LOOSE', '稀'), (0, assessment_specs_1.o)('FORMED', '成形'), (0, assessment_specs_1.o)('WATERY', '水样'), (0, assessment_specs_1.o)('MILK_CURD', '带奶瓣')];
exports.DAILY_MOTHER_FIELDS = [
    {
        title: '体温血压',
        fields: [
            (0, assessment_specs_1.dec)('motherTemperature', '体温', { unit: '℃', min: 35, max: 40 }),
            (0, assessment_specs_1.int)('motherPulse', '脉搏', { unit: '次/分', min: 40, max: 180, aiHint: '纸上没有专门栏，常手写在“产妇日常护理”区域边上' }),
            (0, assessment_specs_1.int)('motherBpSystolic', '收缩压(高压)', { unit: 'mmHg', min: 70, max: 220, aiHint: '血压写成 120/78 时，120 是收缩压' }),
            (0, assessment_specs_1.int)('motherBpDiastolic', '舒张压(低压)', { unit: 'mmHg', min: 40, max: 140 }),
        ],
    },
    {
        title: '乳房',
        fields: [
            (0, assessment_specs_1.multi)('breast', '乳房', [(0, assessment_specs_1.o)('NORMAL', '无异常'), (0, assessment_specs_1.o)('CRACKED', '皲裂'), (0, assessment_specs_1.o)('BLISTER', '水泡'), (0, assessment_specs_1.o)('PUS', '化脓')], { aiHint: '“乳房：无异常 皲裂 水泡 化脓”，被圈出的算有；被斜线划掉的不算' }),
            (0, assessment_specs_1.multi)('breastBody', '乳体', [(0, assessment_specs_1.o)('NORMAL', '无异常'), (0, assessment_specs_1.o)('RED', '红'), (0, assessment_specs_1.o)('SWOLLEN', '肿'), (0, assessment_specs_1.o)('HOT', '热'), (0, assessment_specs_1.o)('PAIN', '痛')]),
            (0, assessment_specs_1.single)('milk', '乳汁', MILK),
        ],
    },
    {
        title: '伤口',
        fields: [
            (0, assessment_specs_1.multi)('woundCesarean', '剖宫产伤口', [(0, assessment_specs_1.o)('NORMAL', '无异常'), (0, assessment_specs_1.o)('OOZING', '渗血渗液'), (0, assessment_specs_1.o)('PAIN', '疼痛'), (0, assessment_specs_1.o)('RED_SWOLLEN', '红肿'), (0, assessment_specs_1.o)('PUS', '化脓')]),
            (0, assessment_specs_1.multi)('woundVaginal', '顺产伤口', [(0, assessment_specs_1.o)('NORMAL', '无异常'), (0, assessment_specs_1.o)('PERI_RED_HOT', '周围红肿热痛'), (0, assessment_specs_1.o)('PERINEUM_EDEMA', '会阴水肿'), (0, assessment_specs_1.o)('PUS', '化脓')]),
        ],
    },
    {
        title: '恶露与二便',
        fields: [
            (0, assessment_specs_1.single)('lochiaStatus', '恶露状态', [(0, assessment_specs_1.o)('CLEAN', '已净'), (0, assessment_specs_1.o)('NOT_CLEAN', '未净')]),
            (0, assessment_specs_1.single)('lochiaColor', '恶露颜色', DAILY_LOCHIA_COLOR, { aiHint: '手写如“淡红”对应 PINK，“鲜红/红”对应 BRIGHT_RED，“暗红”对应 DARK_RED' }),
            (0, assessment_specs_1.single)('lochiaAmount', '恶露量', assessment_specs_1.LOCHIA_AMOUNT),
            (0, assessment_specs_1.single)('lochiaOdor', '恶露气味', assessment_specs_1.LOCHIA_ODOR),
            (0, assessment_specs_1.text)('bowel', '大便'),
            (0, assessment_specs_1.text)('urine', '小便'),
        ],
    },
    {
        title: '妈妈护理计划',
        fields: [
            (0, assessment_specs_1.longtext)('motherPlan', '妈妈护理计划', { aiHint: '“产妇日常护理”区最下面“护理计划”一行的手写内容，如 会阴擦洗消毒' }),
        ],
    },
];
exports.DAILY_BABY_FIELDS = [
    {
        title: '基本与体温',
        fields: [
            (0, assessment_specs_1.int)('ageDays', '出生天数', { unit: '天', min: 0, max: 200 }),
            (0, assessment_specs_1.int)('weightG', '宝宝体重', { unit: 'g', min: 1000, max: 12000, aiHint: '单位是克，如 4340；纸上写 4340g 填 4340；写成 4.34kg 要换成 4340' }),
            (0, assessment_specs_1.dec)('lengthCm', '宝宝身长', { unit: 'cm', min: 25, max: 120, aiHint: '纸质单上多半没有这一项，没写就留空；用于生长曲线' }),
            (0, assessment_specs_1.dec)('headCm', '宝宝头围', { unit: 'cm', min: 20, max: 60, aiHint: '纸质单上多半没有这一项，没写就留空；用于生长曲线' }),
            (0, assessment_specs_1.dec)('tempMorning', '体温(早)', { unit: '℃', min: 35, max: 40 }),
            (0, assessment_specs_1.dec)('tempEvening', '体温(晚)', { unit: '℃', min: 35, max: 40 }),
        ],
    },
    {
        title: '体征（不勾 = 无异常）',
        fields: [
            (0, assessment_specs_1.multi)('eye', '眼', [(0, assessment_specs_1.o)('SECRETION', '分泌物'), (0, assessment_specs_1.o)('RED', '发红'), (0, assessment_specs_1.o)('SWOLLEN', '肿胀')], { aiHint: SIGN_HINT }),
            (0, assessment_specs_1.multi)('mouth', '口', [(0, assessment_specs_1.o)('THRUSH', '鹅口疮'), (0, assessment_specs_1.o)('ULCER', '破溃'), (0, assessment_specs_1.o)('OTHER', '其他')]),
            (0, assessment_specs_1.multi)('nose', '鼻', [(0, assessment_specs_1.o)('SECRETION', '分泌物'), (0, assessment_specs_1.o)('OTHER', '其他')]),
            (0, assessment_specs_1.multi)('umbilical', '脐带', [(0, assessment_specs_1.o)('FALLEN', '已脱'), (0, assessment_specs_1.o)('NOT_FALLEN', '未脱'), (0, assessment_specs_1.o)('BLEEDING', '渗血')], { aiHint: SIGN_HINT + '“脐带：已脱 未脱 渗血”——如果“未脱”被划掉就不要选 NOT_FALLEN；“已脱”没被划掉也没被圈出，不算选中，除非明显打了勾/圈了' }),
            (0, assessment_specs_1.multi)('genitalia', '生殖器', [(0, assessment_specs_1.o)('RED_SWOLLEN', '红肿'), (0, assessment_specs_1.o)('OTHER', '其他')]),
            (0, assessment_specs_1.multi)('skin', '皮肤', [(0, assessment_specs_1.o)('ECZEMA', '湿疹/红斑'), (0, assessment_specs_1.o)('RED_BUTTOCKS', '红臀'), (0, assessment_specs_1.o)('OTHER', '其他')]),
            (0, assessment_specs_1.text)('healthAssessment', '健康评估'),
        ],
    },
    {
        title: '黄疸值',
        fields: [
            (0, assessment_specs_1.dec)('jaundiceForehead', '黄疸-前额', { min: 0, max: 30, aiHint: '多手写在白班护理总结栏里，三个数依次是 前额、眼角、前胸' }),
            (0, assessment_specs_1.dec)('jaundiceCanthus', '黄疸-眼角', { min: 0, max: 30 }),
            (0, assessment_specs_1.dec)('jaundiceChest', '黄疸-前胸', { min: 0, max: 30 }),
        ],
    },
    {
        title: '护理计划与班次总结',
        fields: [
            (0, assessment_specs_1.longtext)('babyPlan', '宝宝护理计划', { aiHint: '“总结”下面“护理计划”一行（宝宝的），如 抚触、晒黄疸' }),
            (0, assessment_specs_1.longtext)('dayShiftSummary', '白班护理总结', { aiHint: '右侧“白班护理总结”大框里的手写内容（黄疸值数字单独放进黄疸字段，不要重复）' }),
            (0, assessment_specs_1.longtext)('nightShiftSummary', '夜班护理总结'),
            (0, assessment_specs_1.text)('dayNurseName', '护理师签字（白班）', { aiHint: '“白班护理总结”下面的“护理师签字”' }),
            (0, assessment_specs_1.text)('babyClientSigner', '客户签字（白班）', { aiHint: '“白班护理总结”下面的“客户签字”' }),
            (0, assessment_specs_1.text)('nightNurseName', '护理师签字（夜班）', { aiHint: '“夜班护理总结”下面的“护理师签字”（右下角）' }),
            (0, assessment_specs_1.text)('nightClientSigner', '客户签字（夜班）', { aiHint: '“夜班护理总结”下面的“客户签字”（右下角）' }),
        ],
    },
];
exports.FEEDING_COLUMNS = [
    (0, assessment_specs_1.text)('time', '时间', { hint: 'HH:mm', aiHint: '24 小时制 HH:mm，如 14:20、2:00 写成 02:00。只填开始时间：写了“18:30左右”或“18:30-18:41”只取 18:30，其余字样（左右/结束时间/时长）写进备注' }),
    (0, assessment_specs_1.int)('directFeedMin', '亲喂(分钟)', { min: 0, max: 90, aiHint: '“亲喂”列：只有这一行的亲喂格里真的有手写时长才填分钟数；只打了勾没写时长填 0；这一格是空的（比如这行喝的是奶粉）一定填 null，不要填 0' }),
    (0, assessment_specs_1.int)('breastMilkMl', '母乳(ml)', { min: 0, max: 300 }),
    (0, assessment_specs_1.int)('formulaMl', '奶粉(ml)', { min: 0, max: 300, aiHint: '“奶粉”列的毫升数，如 80ml 填 80；前面带“补”“(补)”等字样也照样填数字，字样写进备注；这一列有字就一定要读出来，不要漏' }),
    (0, assessment_specs_1.text)('medication', '药名', { aiHint: '“用药/药物”列手写的药名；没写留空' }),
    (0, assessment_specs_1.text)('medicationDose', '剂量', { aiHint: '药物的剂量，如 2滴、0.5ml；没写留空' }),
    (0, assessment_specs_1.int)('waterMl', '喂水(ml)', { min: 0, max: 200 }),
    (0, assessment_specs_1.single)('urine', '小便', [(0, assessment_specs_1.o)('YES', '有')], { aiHint: '“小便”列打了勾填 YES，没有则 null' }),
    (0, assessment_specs_1.single)('stool', '大便', [(0, assessment_specs_1.o)('YES', '有')], { aiHint: '“大便（颜色/量/性）”列有手写内容就填 YES' }),
    (0, assessment_specs_1.single)('stoolColor', '大便颜色', STOOL_COLOR),
    (0, assessment_specs_1.single)('stoolAmount', '大便量', STOOL_AMOUNT),
    (0, assessment_specs_1.single)('stoolTexture', '大便性状', STOOL_TEXTURE),
    (0, assessment_specs_1.text)('nurseName', '责护签字'),
];
exports.NURSING_COLUMNS = [
    (0, assessment_specs_1.text)('time', '时间', { hint: 'HH:mm' }),
    (0, assessment_specs_1.single)('morningCare', '晨护', [(0, assessment_specs_1.o)('YES', '已做')]),
    (0, assessment_specs_1.single)('cordCare', '脐带护理', [(0, assessment_specs_1.o)('YES', '已做')]),
    (0, assessment_specs_1.single)('skinCare', '皮肤护理', [(0, assessment_specs_1.o)('YES', '已做')]),
    (0, assessment_specs_1.single)('hipCare', '臀部护理', [(0, assessment_specs_1.o)('YES', '已做')]),
    (0, assessment_specs_1.single)('faceCare', '面部护理', [(0, assessment_specs_1.o)('YES', '已做')]),
    (0, assessment_specs_1.single)('swimming', '游泳', [(0, assessment_specs_1.o)('YES', '已做')]),
    (0, assessment_specs_1.single)('bathing', '洗澡', [(0, assessment_specs_1.o)('YES', '已做')]),
    (0, assessment_specs_1.single)('massage', '抚触', [(0, assessment_specs_1.o)('YES', '已做')]),
    (0, assessment_specs_1.single)('earlyEdu', '早教', [(0, assessment_specs_1.o)('YES', '已做')]),
    (0, assessment_specs_1.text)('otherCare', '其他'),
    (0, assessment_specs_1.text)('nurseName', '责护签字'),
];
const dailyFlatFields = () => [...exports.DAILY_MOTHER_FIELDS, ...exports.DAILY_BABY_FIELDS].flatMap((g) => g.fields);
exports.dailyFlatFields = dailyFlatFields;
exports.DAILY_AI_DESCRIPTION = '《新生儿和产妇日常护理记录》：横版的一天一张纸。左上是宝宝体征和体温，中间是“24小时宝宝喂养记录单”（多行表格，每行一次喂养/排泄），右侧是白班/夜班护理总结和签字，' +
    '下面是“产妇日常护理”（乳房、伤口、恶露、体温）和护理计划。印刷表格，护理师手写和打钩/画圈。';
exports.DAILY_BABY_AI_DESCRIPTION = '《新生儿日常护理记录》宝宝单页，横版，一天一张。表头一行：房号、妈妈姓名、入住天数、出生天数、宝宝体重（kg）、体温（早/晚）；体征区：眼/口/鼻/脐带/生殖器/皮肤（被圈出=有异常，被斜线划掉=没有）和健康评估；' +
    '中间是“24小时宝宝喂养记录单”表格，每个有手写内容的行 = 一次喂养/排泄，列依次是：时间、亲喂、母乳、奶粉、用药、喂水、小便（打勾）、大便（颜色/量/性，手写如“绿糊中”“黄糊中”“点”）、责护签字、备注；' +
    '表格右侧是“白班护理总结”（含黄疸值数字，如 7.0-7.7-6.2 = 前额-眼角-前胸）；右下角是护理师签字和客户签字。印刷表格，手写和打勾。没写内容的空行不要输出。' +
    '大便手写对应：颜色 黄/绿/墨绿/褐，性状 糊=糊状、稀、成形，量 点/少/中/多。';
//# sourceMappingURL=daily-specs.js.map