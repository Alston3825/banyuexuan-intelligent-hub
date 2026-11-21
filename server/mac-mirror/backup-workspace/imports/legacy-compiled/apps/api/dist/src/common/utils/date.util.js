"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDays = addDays;
function addDays(date, days) {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
}
//# sourceMappingURL=date.util.js.map