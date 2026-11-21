"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assessment_specs_1 = require("../src/care/care-assessment/assessment-specs");
const daily_specs_1 = require("../src/care/care-daily/daily-specs");
const out = {};
for (const [type, spec] of Object.entries(assessment_specs_1.FORM_SPECS)) {
    out[type] = { title: spec.title, description: spec.aiDescription, fields: (0, assessment_specs_1.allFields)(spec) };
}
out.DAILY_RECORD = {
    title: '新生儿和产妇日常护理记录',
    description: daily_specs_1.DAILY_AI_DESCRIPTION,
    fields: [...(0, daily_specs_1.dailyFlatFields)(), { key: 'feedings', label: '24小时宝宝喂养记录单', kind: 'table', columns: daily_specs_1.FEEDING_COLUMNS }],
};
console.log(JSON.stringify(out));
//# sourceMappingURL=dump-assessment-specs.js.map