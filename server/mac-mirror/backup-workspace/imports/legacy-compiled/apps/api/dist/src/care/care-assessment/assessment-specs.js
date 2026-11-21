"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.columnName = exports.allFields = exports.FORM_SPECS = exports.multi = exports.single = exports.date = exports.dec = exports.int = exports.longtext = exports.text = exports.LOCHIA_ODOR = exports.LOCHIA_COLOR = exports.LOCHIA_AMOUNT = exports.NORMAL_ABNORMAL = exports.YES_NO = exports.o = exports.ASSESSMENT_TYPES = void 0;
exports.ASSESSMENT_TYPES = ['MOTHER_ADMISSION', 'BABY_ADMISSION', 'MOTHER_DISCHARGE', 'BABY_DISCHARGE'];
const o = (value, label) => ({ value, label });
exports.o = o;
exports.YES_NO = [(0, exports.o)('YES', '有'), (0, exports.o)('NO', '无')];
exports.NORMAL_ABNORMAL = [(0, exports.o)('NORMAL', '正常'), (0, exports.o)('ABNORMAL', '异常')];
const DELIVERY = [(0, exports.o)('VAGINAL', '顺产'), (0, exports.o)('CESAREAN', '剖腹产'), (0, exports.o)('VAGINAL_TO_CESAREAN', '顺转剖')];
exports.LOCHIA_AMOUNT = [(0, exports.o)('MANY', '量多'), (0, exports.o)('MEDIUM', '量中'), (0, exports.o)('FEW', '量少'), (0, exports.o)('NONE', '无')];
exports.LOCHIA_COLOR = [(0, exports.o)('BRIGHT_RED', '鲜艳/暗红'), (0, exports.o)('PINK', '粉红'), (0, exports.o)('BROWN', '褐色'), (0, exports.o)('LIGHT_BROWN', '浅褐色'), (0, exports.o)('WHITE_YELLOW', '白色淡黄色')];
exports.LOCHIA_ODOR = [(0, exports.o)('NONE', '无异味'), (0, exports.o)('FOUL', '腥臭味')];
const NIPPLE = [(0, exports.o)('NORMAL', '正常'), (0, exports.o)('DEPRESSED', '凹陷'), (0, exports.o)('FLAT', '短平'), (0, exports.o)('CRACKED', '皲裂'), (0, exports.o)('WHITE_BLISTER', '白点、白泡')];
const text = (key, label, extra = {}) => ({ key, label, kind: 'text', ...extra });
exports.text = text;
const longtext = (key, label, extra = {}) => ({ key, label, kind: 'longtext', ...extra });
exports.longtext = longtext;
const int = (key, label, extra = {}) => ({ key, label, kind: 'int', ...extra });
exports.int = int;
const dec = (key, label, extra = {}) => ({ key, label, kind: 'decimal', ...extra });
exports.dec = dec;
const date = (key, label, extra = {}) => ({ key, label, kind: 'date', ...extra });
exports.date = date;
const single = (key, label, options, extra = {}) => ({ key, label, kind: 'single', options, ...extra });
exports.single = single;
const multi = (key, label, options, extra = {}) => ({ key, label, kind: 'multi', options, ...extra });
exports.multi = multi;
const vitals = () => [
    (0, exports.dec)('temperature', '体温', { unit: '℃', min: 35, max: 40 }),
    (0, exports.int)('pulse', '脉搏', { unit: '次/分', min: 40, max: 180 }),
    (0, exports.int)('respiration', '呼吸', { unit: '次/分', min: 8, max: 40 }),
    (0, exports.int)('bpSystolic', '收缩压(高压)', { unit: 'mmHg', min: 70, max: 220, aiHint: '血压写成 114/80 时，114 是收缩压、80 是舒张压' }),
    (0, exports.int)('bpDiastolic', '舒张压(低压)', { unit: 'mmHg', min: 40, max: 140 }),
];
const motherAdmission = {
    type: 'MOTHER_ADMISSION',
    title: '产妇入住评估单',
    subject: 'MOTHER',
    model: 'careMotherAdmission',
    aiDescription: '《产妇入住评估单》：入住当天对产妇做的评估，印刷表格，护理师手写和打钩。',
    groups: [
        {
            title: '基本信息',
            fields: [
                (0, exports.int)('age', '年龄', { unit: '岁', min: 14, max: 60 }),
                (0, exports.text)('gestationalWeeks', '孕周', { hint: '如 40+4', aiHint: '原样抄写，如 40+4、39' }),
                (0, exports.single)('bloodType', '血型', [(0, exports.o)('A', 'A'), (0, exports.o)('B', 'B'), (0, exports.o)('AB', 'AB'), (0, exports.o)('O', 'O'), (0, exports.o)('UNKNOWN', '不详')]),
                (0, exports.text)('deliveryHospital', '分娩医院'),
                (0, exports.date)('admissionDate', '入所日期'),
                (0, exports.date)('deliveryDate', '分娩日期'),
                (0, exports.single)('deliveryMethod', '分娩方式', DELIVERY),
                (0, exports.dec)('heightCm', '身高', { unit: 'cm', min: 130, max: 190 }),
                (0, exports.dec)('weightKg', '体重', { unit: 'kg', min: 35, max: 130 }),
            ],
        },
        {
            title: '病史',
            fields: [
                (0, exports.text)('chiefComplaint', '主诉'),
                (0, exports.single)('allergyHistory', '过敏史', exports.YES_NO),
                (0, exports.text)('allergyNote', '过敏说明'),
                (0, exports.text)('pastHistory', '既往病史'),
                (0, exports.text)('pregnancyComplications', '孕期合并症'),
                (0, exports.text)('abnormalDeliveryReason', '异常生产原因'),
                (0, exports.single)('hemorrhoids', '痔疮', [(0, exports.o)('NONE', '无'), (0, exports.o)('INTERNAL', '内痔'), (0, exports.o)('EXTERNAL', '外痔'), (0, exports.o)('MIXED', '混合痔')]),
            ],
        },
        { title: '生命体征', fields: vitals() },
        {
            title: '腹部与产科',
            fields: [
                (0, exports.dec)('fundusFingersBelowNavel', '子宫高度：脐下几指', { unit: '指', min: 0, max: 6 }),
                (0, exports.text)('uterineContraction', '宫缩情况'),
                (0, exports.single)('breast', '乳房', exports.NORMAL_ABNORMAL),
                (0, exports.text)('breastNote', '乳房异常说明'),
                (0, exports.single)('nipple', '乳头', exports.NORMAL_ABNORMAL),
                (0, exports.text)('nippleNote', '乳头异常说明'),
                (0, exports.multi)('perineum', '会阴', [(0, exports.o)('TEAR_INCISION', '撕裂/侧切'), (0, exports.o)('EDEMA', '水肿'), (0, exports.o)('OTHER', '其他')]),
                (0, exports.text)('perineumNote', '会阴其他说明'),
                (0, exports.multi)('woundDressing', '剖宫产腹部伤口敷料', [(0, exports.o)('INTACT', '完整'), (0, exports.o)('DRY', '干燥'), (0, exports.o)('EXUDATE', '渗出')]),
                (0, exports.text)('dressingNote', '敷料备注', { hint: '如 3-5 天', aiHint: '“伤口敷料”旁边手写的天数提示，如 3-5天' }),
                (0, exports.single)('lochiaColor', '恶露颜色', exports.LOCHIA_COLOR, { aiHint: '“恶露情况—性质”栏，如 淡红 对应 PINK' }),
                (0, exports.single)('lochiaAmount', '恶露量', exports.LOCHIA_AMOUNT),
                (0, exports.single)('lochiaOdor', '恶露气味', exports.LOCHIA_ODOR),
            ],
        },
        {
            title: '其他',
            fields: [
                (0, exports.single)('legEdema', '下肢水肿', [(0, exports.o)('NONE', '无'), (0, exports.o)('MILD', '轻'), (0, exports.o)('MODERATE', '中'), (0, exports.o)('SEVERE', '重')], { aiHint: '“下肢水肿”只有 轻/中/重 三个框，都没勾则为 NONE' }),
                (0, exports.single)('nightSweat', '盗汗', exports.YES_NO),
                (0, exports.text)('dietTaboo', '饮食禁忌'),
                (0, exports.longtext)('handlingNotes', '处理', { aiHint: '底部“处理”大框里的手写条目（1. 2. 3. …），按行抄写，每条一行' }),
            ],
        },
        {
            title: '签名',
            fields: [(0, exports.text)('assessorName', '评估人员'), (0, exports.text)('responsibleNurseName', '责任护士'), (0, exports.text)('clientSignerName', '宝妈或家属签字'), (0, exports.date)('assessedAt', '评估日期')],
        },
    ],
};
const babyAdmission = {
    type: 'BABY_ADMISSION',
    title: '新生儿入所评估',
    subject: 'BABY',
    model: 'careBabyAdmission',
    aiDescription: '《新生儿入所评估》：宝宝入住当天的全身评估，印刷表格，护理师手写和打钩。',
    groups: [
        {
            title: '基本信息',
            fields: [
                (0, exports.text)('gestationalWeeks', '孕周', { hint: '如 40+4' }),
                (0, exports.date)('birthDate', '出生日期', { aiHint: '宝宝的出生日期（不是入所日期）；纸上若只写了“出生天数/日龄”没有日期，留空' }),
                (0, exports.date)('admissionDate', '入所日期', { hint: '入所体重/身长/头围就是这一天量的，生长曲线按这个日期画点，请务必填' }),
                (0, exports.single)('mentalState', '精神状况', [(0, exports.o)('GOOD', '好'), (0, exports.o)('FAIR', '一般'), (0, exports.o)('POOR', '差')]),
                (0, exports.single)('birthMethod', '出生方式', DELIVERY),
                (0, exports.int)('birthWeightG', '出生体重', { unit: 'g', min: 1000, max: 6000, aiHint: '换算成克，如 3750g 填 3750；写 3.75kg 也要换成 3750' }),
                (0, exports.dec)('birthLengthCm', '出生身长', { unit: 'cm', min: 35, max: 65 }),
                (0, exports.int)('admissionWeightG', '入所体重', { unit: 'g', min: 1000, max: 7000, aiHint: '换算成克' }),
                (0, exports.dec)('admissionLengthCm', '入所身长', { unit: 'cm', min: 35, max: 70 }),
                (0, exports.dec)('headCircumferenceCm', '入所头围', { unit: 'cm', min: 28, max: 42 }),
                (0, exports.dec)('chestCircumferenceCm', '入所胸围', { unit: 'cm', min: 25, max: 45 }),
                (0, exports.dec)('temperature', '入所体温', { unit: '℃', min: 35, max: 40 }),
                (0, exports.single)('breastCondition', '乳房情况', exports.NORMAL_ABNORMAL),
            ],
        },
        {
            title: '生殖器官',
            fields: [
                (0, exports.single)('testis', '男：睾丸', [(0, exports.o)('DESCENDED', '已降'), (0, exports.o)('NOT_DESCENDED', '未降')]),
                (0, exports.single)('hydrocele', '男：鞘膜积液', exports.YES_NO),
                (0, exports.single)('urethraMale', '男：尿道', [(0, exports.o)('NORMAL', '正常'), (0, exports.o)('RED_SWOLLEN', '红肿')]),
                (0, exports.single)('labiaDevelopment', '女：阴蒂阴唇发育', exports.NORMAL_ABNORMAL),
                (0, exports.text)('labiaNote', '女：发育异常说明'),
                (0, exports.single)('vaginalDischarge', '女：阴道分泌物', exports.YES_NO),
                (0, exports.text)('vaginalDischargeNote', '女：分泌物说明'),
                (0, exports.single)('urethraFemale', '女：尿道', exports.NORMAL_ABNORMAL),
                (0, exports.text)('urethraFemaleNote', '女：尿道异常说明'),
            ],
        },
        {
            title: '全身检查',
            fields: [
                (0, exports.single)('head', '头部', [(0, exports.o)('NORMAL', '正常'), (0, exports.o)('HEMATOMA', '血肿')]),
                (0, exports.multi)('skin', '皮肤', [(0, exports.o)('DRY', '干燥'), (0, exports.o)('NORMAL', '正常'), (0, exports.o)('RASH', '红疹'), (0, exports.o)('DAMAGED', '皮损')]),
                (0, exports.text)('fontanelle', '前囟'),
                (0, exports.text)('facialFeatures', '五官'),
                (0, exports.text)('oralCavity', '口腔'),
                (0, exports.single)('hearingScreening', '听力筛查', [(0, exports.o)('PASS', '通过'), (0, exports.o)('FAIL', '未通过')]),
                (0, exports.text)('neck', '颈部'),
                (0, exports.text)('anus', '肛门'),
                (0, exports.text)('lungs', '肺部'),
                (0, exports.single)('heart', '心脏', exports.NORMAL_ABNORMAL),
                (0, exports.text)('heartNote', '心脏异常原因'),
                (0, exports.text)('abdomen', '腹部'),
                (0, exports.single)('limbs', '四肢活动', exports.NORMAL_ABNORMAL),
                (0, exports.text)('limbsNote', '四肢异常原因'),
                (0, exports.single)('umbilicalStatus', '脐带', [(0, exports.o)('DRY_STUMP', '干结'), (0, exports.o)('FALLEN', '脱落')]),
                (0, exports.multi)('umbilicalAbnormal', '脐带异常', [(0, exports.o)('BLEEDING', '渗血'), (0, exports.o)('OOZING', '渗液'), (0, exports.o)('ODOR', '异味'), (0, exports.o)('RED', '红'), (0, exports.o)('SWOLLEN', '肿')]),
                (0, exports.single)('buttocks', '臀部', [(0, exports.o)('NORMAL', '正常'), (0, exports.o)('DIAPER_RASH', '尿布疹'), (0, exports.o)('DAMAGED', '皮损'), (0, exports.o)('OTHER', '其它')]),
            ],
        },
        {
            title: '疫苗与筛查',
            fields: [
                (0, exports.single)('hepB', '乙肝疫苗已接种', [(0, exports.o)('YES', '是'), (0, exports.o)('NO', '否')]),
                (0, exports.single)('bcg', '卡介苗已接种', [(0, exports.o)('YES', '是'), (0, exports.o)('NO', '否')]),
                (0, exports.text)('vaccineReason', '未接种原因'),
                (0, exports.dec)('jaundiceForehead', '黄疸值-前额', { min: 0, max: 30, aiHint: '“入所时黄疸值”栏，三个数字分别对应 前额、眼角、前胸' }),
                (0, exports.dec)('jaundiceCanthus', '黄疸值-眼角', { min: 0, max: 30 }),
                (0, exports.dec)('jaundiceChest', '黄疸值-前胸', { min: 0, max: 30 }),
                (0, exports.single)('pku', 'PKU足底血已采', [(0, exports.o)('YES', '是'), (0, exports.o)('NO', '否')]),
                (0, exports.text)('pkuReason', '未采原因'),
            ],
        },
        {
            title: '喂养',
            fields: [
                (0, exports.single)('feedingMethod', '喂养方式', [(0, exports.o)('BREAST', '母乳喂养'), (0, exports.o)('MIXED', '混合喂养'), (0, exports.o)('FORMULA', '人工喂养')]),
                (0, exports.int)('formulaMl', '人工喂养每次奶量', { unit: 'ml', min: 10, max: 200 }),
                (0, exports.single)('feedingStatus', '吃奶情况', [(0, exports.o)('GOOD', '好'), (0, exports.o)('FAIR', '一般'), (0, exports.o)('POOR', '差')]),
                (0, exports.multi)('feedingIssues', '吐奶/呛奶', [(0, exports.o)('SPIT_UP', '吐奶'), (0, exports.o)('CHOKING', '呛奶')]),
                (0, exports.longtext)('specialNotes', '特殊情况', { aiHint: '底部“特殊情况”大框里的手写条目，按行抄写，每条一行' }),
            ],
        },
        {
            title: '签名',
            fields: [(0, exports.text)('assessorName', '评估人员'), (0, exports.text)('responsibleNurseName', '责护'), (0, exports.text)('clientSignerName', '宝妈或家属签字'), (0, exports.date)('assessedAt', '评估日期')],
        },
    ],
};
const motherDischarge = {
    type: 'MOTHER_DISCHARGE',
    title: '妈妈出所健康评估表',
    subject: 'MOTHER',
    model: 'careMotherDischarge',
    aiDescription: '《妈妈出所健康评估表》：离店前对妈妈做的 17 项评估，印刷表格，护理师手写数字和打钩。',
    groups: [
        {
            title: '基本信息',
            fields: [(0, exports.date)('admissionDate', '入住日期'), (0, exports.date)('dischargeDate', '出所日期'), (0, exports.int)('age', '年龄', { unit: '岁', min: 14, max: 60 })],
        },
        { title: '1 生命体征', fields: vitals() },
        {
            title: '2-3 形态与子宫',
            fields: [
                (0, exports.dec)('heightCm', '身高', { unit: 'cm', min: 130, max: 190 }),
                (0, exports.dec)('weightKg', '体重', { unit: 'kg', min: 35, max: 130 }),
                (0, exports.single)('fundus', '子宫恢复', [(0, exports.o)('NOT_IN_PELVIS', '未入盆'), (0, exports.o)('IN_PELVIS', '已入盆')]),
                (0, exports.dec)('fundusFingersBelowNavel', '未入盆：脐下几指', { unit: '指', min: 0, max: 6 }),
            ],
        },
        {
            title: '4-7 恶露',
            fields: [
                (0, exports.single)('lochiaAmount', '恶露量', exports.LOCHIA_AMOUNT),
                (0, exports.single)('lochiaColor', '颜色', exports.LOCHIA_COLOR),
                (0, exports.single)('lochiaProperty', '性状', [(0, exports.o)('THIN', '稀薄'), (0, exports.o)('STICKY', '粘稠'), (0, exports.o)('CLOTS', '血块')]),
                (0, exports.single)('lochiaOdor', '味道', exports.LOCHIA_ODOR),
            ],
        },
        {
            title: '8-13 伤口与乳房',
            fields: [
                (0, exports.multi)('woundSite', '伤口部位', [(0, exports.o)('PERINEUM', '会阴伤口'), (0, exports.o)('ABDOMEN', '腹部伤口')]),
                (0, exports.multi)('woundStatus', '伤口情况', [(0, exports.o)('NORMAL', '正常'), (0, exports.o)('RED_SWOLLEN', '红肿'), (0, exports.o)('BLEEDING', '渗血'), (0, exports.o)('OOZING', '渗液'), (0, exports.o)('SUTURE_REJECTION', '线头排异')]),
                (0, exports.multi)('breastStatus', '乳房', [(0, exports.o)('SOFT', '柔软'), (0, exports.o)('SWOLLEN', '肿胀'), (0, exports.o)('LUMP', '硬块'), (0, exports.o)('PAIN', '疼痛'), (0, exports.o)('SKIN_DAMAGE', '皮肤破损')]),
                (0, exports.multi)('leftNipple', '左侧乳头', NIPPLE),
                (0, exports.multi)('rightNipple', '右侧乳头', NIPPLE),
                (0, exports.single)('milkSecretion', '乳汁分泌', [(0, exports.o)('NONE', '无'), (0, exports.o)('LITTLE', '少量'), (0, exports.o)('MEDIUM', '中量'), (0, exports.o)('MUCH', '量多')]),
                (0, exports.single)('hemorrhoids', '痔疮', exports.YES_NO),
                (0, exports.text)('hemorrhoidsNote', '痔疮说明'),
            ],
        },
        {
            title: '14-17 其他',
            fields: [
                (0, exports.single)('bowel', '排便情况', exports.NORMAL_ABNORMAL),
                (0, exports.single)('mentalState', '精神状态', [(0, exports.o)('NORMAL', '正常'), (0, exports.o)('POOR', '欠佳'), (0, exports.o)('TIRED', '疲倦'), (0, exports.o)('WEAK', '虚弱')]),
                (0, exports.multi)('edema', '水肿情况', [(0, exports.o)('NORMAL', '正常'), (0, exports.o)('LEG', '下肢'), (0, exports.o)('FACE', '脸部')]),
                (0, exports.longtext)('otherSpecial', '其他特殊情况'),
                (0, exports.longtext)('dischargeTips', '出所温馨提示'),
            ],
        },
        { title: '签名', fields: [(0, exports.text)('assessorName', '评估人员'), (0, exports.date)('assessedAt', '评估日期')] },
    ],
};
const babyDischarge = {
    type: 'BABY_DISCHARGE',
    title: '宝宝出所健康评估表',
    subject: 'BABY',
    model: 'careBabyDischarge',
    aiDescription: '《宝宝出所健康评估表》：离店前对宝宝做的 9 项评估，印刷表格，护理师手写数字和打钩。',
    groups: [
        {
            title: '基本信息',
            fields: [(0, exports.int)('ageDays', '日龄', { unit: '天', min: 0, max: 200 }), (0, exports.date)('admissionDate', '入所日期'), (0, exports.date)('dischargeDate', '出所日期')],
        },
        {
            title: '1 一般测量',
            fields: [
                (0, exports.dec)('temperature', '体温', { unit: '℃', min: 35, max: 40 }),
                (0, exports.int)('respiration', '呼吸', { unit: '次/分', min: 20, max: 80 }),
                (0, exports.dec)('admissionLengthCm', '入所身长', { unit: 'cm', min: 35, max: 70 }),
                (0, exports.dec)('dischargeLengthCm', '出所身长', { unit: 'cm', min: 40, max: 90 }),
                (0, exports.int)('admissionWeightG', '入所体重', { unit: 'g', min: 1000, max: 7000, aiHint: '单位是克，如 3790；写成 3.79kg 要换成 3790' }),
                (0, exports.int)('dischargeWeightG', '出所体重', { unit: 'g', min: 2000, max: 12000, aiHint: '单位是克，如 4930；写成 4.93kg 要换成 4930' }),
                (0, exports.dec)('admissionHeadCm', '入所头围', { unit: 'cm', min: 28, max: 42 }),
                (0, exports.dec)('dischargeHeadCm', '出所头围', { unit: 'cm', min: 30, max: 48 }),
            ],
        },
        {
            title: '2 皮肤情况',
            fields: [
                (0, exports.dec)('admissionJaundiceForehead', '入所黄疸-前额', { min: 0, max: 30, aiHint: '“黄疸值”行：入所三个数（前额、眼角、前胸），出所三个数（前额、眼角、前胸）' }),
                (0, exports.dec)('admissionJaundiceCanthus', '入所黄疸-眼角', { min: 0, max: 30 }),
                (0, exports.dec)('admissionJaundiceChest', '入所黄疸-前胸', { min: 0, max: 30 }),
                (0, exports.dec)('dischargeJaundiceForehead', '出所黄疸-前额', { min: 0, max: 30 }),
                (0, exports.dec)('dischargeJaundiceCanthus', '出所黄疸-眼角', { min: 0, max: 30 }),
                (0, exports.dec)('dischargeJaundiceChest', '出所黄疸-前胸', { min: 0, max: 30 }),
                (0, exports.text)('rash', '皮疹'),
                (0, exports.text)('redButtocks', '红臀'),
            ],
        },
        {
            title: '3 头面部',
            fields: [
                (0, exports.text)('headFinding', '头部'),
                (0, exports.text)('face', '面部'),
                (0, exports.text)('sclera', '巩膜'),
                (0, exports.text)('eyeSecretion', '眼部分泌物'),
                (0, exports.single)('ear', '耳部', [(0, exports.o)('NORMAL', '正常'), (0, exports.o)('DISCHARGE', '分泌物')]),
                (0, exports.text)('earNote', '耳部其他'),
                (0, exports.text)('oralCavity', '口腔'),
                (0, exports.text)('mucosa', '粘膜'),
                (0, exports.text)('throat', '咽'),
                (0, exports.text)('tongue', '舌'),
                (0, exports.single)('neck', '颈部', [(0, exports.o)('SOFT', '软'), (0, exports.o)('RESIST', '抵抗'), (0, exports.o)('RIGID', '强制'), (0, exports.o)('OTHER', '其他')]),
            ],
        },
        {
            title: '4-9 其他部位',
            fields: [
                (0, exports.single)('feedingMethod', '喂养', [(0, exports.o)('FORMULA', '人工喂养'), (0, exports.o)('BREAST', '母乳喂养'), (0, exports.o)('MIXED', '混合喂养')]),
                (0, exports.single)('breastRedSwollen', '胸部乳房红肿', exports.YES_NO),
                (0, exports.multi)('umbilical', '脐部', [(0, exports.o)('FALLEN', '已脱'), (0, exports.o)('NOT_FALLEN', '未脱'), (0, exports.o)('OOZING', '渗液'), (0, exports.o)('RED_SWOLLEN', '红肿'), (0, exports.o)('OTHER', '其他')]),
                (0, exports.text)('umbilicalNote', '脐部其他说明'),
                (0, exports.single)('testis', '男孩：睾丸', [(0, exports.o)('DESCENDED', '已降'), (0, exports.o)('NOT_DESCENDED', '未降')]),
                (0, exports.multi)('maleFindings', '男孩：其他', [(0, exports.o)('HYDROCELE', '鞘膜积液'), (0, exports.o)('SCROTAL_FOLDS', '阴囊皱襞'), (0, exports.o)('URETHRAL_RED', '尿道口红肿')]),
                (0, exports.text)('labiaDevelopment', '女孩：阴蒂阴唇发育'),
                (0, exports.text)('vaginalDischarge', '女孩：阴道分泌物'),
                (0, exports.text)('urethraOpening', '女孩：尿道口'),
                (0, exports.text)('otherMalformation', '其他畸形'),
                (0, exports.single)('anus', '肛门', [(0, exports.o)('NORMAL', '无异常'), (0, exports.o)('MALFORMED', '畸形'), (0, exports.o)('OTHER', '其他')]),
                (0, exports.text)('anusNote', '肛门说明'),
                (0, exports.single)('spineLimbs', '脊柱四肢', [(0, exports.o)('NORMAL', '无异常'), (0, exports.o)('MALFORMED', '畸形'), (0, exports.o)('TONE', '四肢活动和张力')]),
                (0, exports.text)('spineLimbsNote', '脊柱四肢说明'),
                (0, exports.longtext)('dischargeTips', '出所温馨提示'),
            ],
        },
        { title: '签名', fields: [(0, exports.text)('assessorName', '护理师'), (0, exports.text)('clientSignerName', '宝妈或家属签字'), (0, exports.date)('assessedAt', '评估日期')] },
    ],
};
exports.FORM_SPECS = {
    MOTHER_ADMISSION: motherAdmission,
    BABY_ADMISSION: babyAdmission,
    MOTHER_DISCHARGE: motherDischarge,
    BABY_DISCHARGE: babyDischarge,
};
const allFields = (spec) => spec.groups.flatMap((g) => g.fields);
exports.allFields = allFields;
const columnName = (key) => key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
exports.columnName = columnName;
//# sourceMappingURL=assessment-specs.js.map