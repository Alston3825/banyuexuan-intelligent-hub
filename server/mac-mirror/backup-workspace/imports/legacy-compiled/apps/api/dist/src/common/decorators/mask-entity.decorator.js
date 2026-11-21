"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaskEntity = exports.MASK_ENTITY_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.MASK_ENTITY_KEY = 'maskEntityType';
const MaskEntity = (entityType) => (0, common_1.SetMetadata)(exports.MASK_ENTITY_KEY, entityType);
exports.MaskEntity = MaskEntity;
//# sourceMappingURL=mask-entity.decorator.js.map