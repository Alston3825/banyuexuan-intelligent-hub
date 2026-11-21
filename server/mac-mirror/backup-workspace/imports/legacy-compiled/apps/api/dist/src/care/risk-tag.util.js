"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CARE_RISK_CATEGORY = void 0;
exports.replaceRiskTags = replaceRiskTags;
const common_1 = require("@nestjs/common");
exports.CARE_RISK_CATEGORY = 'CARE_RISK';
async function replaceRiskTags(prisma, p) {
    const wanted = [...new Set(p.tagIds)];
    if (wanted.length > 0) {
        const tags = await prisma.tag.findMany({ where: { id: { in: wanted }, tenantId: p.tenantId } });
        if (tags.length !== wanted.length)
            throw new common_1.BadRequestException('存在不存在的标签');
        const wrong = tags.find((t) => t.category !== exports.CARE_RISK_CATEGORY);
        if (wrong)
            throw new common_1.BadRequestException(`「${wrong.name}」不是母婴风险标签，不能作为风险标签（母婴风险标签请到“基础资料 → 标签管理”里，分类选“母婴风险标签”）`);
    }
    const current = await prisma.tagBinding.findMany({ where: { entityType: p.entityType, entityId: p.entityId, revokedAt: null } });
    const currentIds = new Set(current.map((c) => c.tagId));
    const removed = current.filter((c) => !wanted.includes(c.tagId));
    const added = wanted.filter((id) => !currentIds.has(id));
    await prisma.$transaction(async (tx) => {
        if (removed.length)
            await tx.tagBinding.updateMany({ where: { id: { in: removed.map((r) => r.id) } }, data: { revokedAt: new Date() } });
        for (const tagId of added) {
            await tx.tagBinding.create({ data: { tagId, entityType: p.entityType, entityId: p.entityId, tenantId: p.tenantId, createdBy: p.accountId } });
        }
    });
    return { added, removed: removed.map((r) => r.tagId) };
}
//# sourceMappingURL=risk-tag.util.js.map