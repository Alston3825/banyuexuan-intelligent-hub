"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditSensitiveQuery = exports.AUDIT_SENSITIVE_QUERY_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.AUDIT_SENSITIVE_QUERY_KEY = 'auditSensitiveQuery';
const AuditSensitiveQuery = () => (0, common_1.SetMetadata)(exports.AUDIT_SENSITIVE_QUERY_KEY, true);
exports.AuditSensitiveQuery = AuditSensitiveQuery;
//# sourceMappingURL=audit-sensitive-query.decorator.js.map