"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBusinessNo = generateBusinessNo;
const crypto_1 = require("crypto");
function generateBusinessNo(prefix) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = (0, crypto_1.randomBytes)(3).toString('hex').toUpperCase();
    return `${prefix}${datePart}${randPart}`;
}
//# sourceMappingURL=business-no.util.js.map