"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.motherProfilesDeleteCheck = motherProfilesDeleteCheck;
exports.deleteMotherProfilesTx = deleteMotherProfilesTx;
exports.addProfileExtras = addProfileExtras;
async function motherProfilesDeleteCheck(db, motherIds) {
    if (motherIds.length === 0)
        return { blockers: [], attached: [], babyCount: 0 };
    const babies = await db.babyProfile.findMany({ where: { motherProfileId: { in: motherIds } }, select: { id: true } });
    const babyIds = babies.map((b) => b.id);
    const mOrB = (mKey) => ({ OR: [{ [mKey]: { in: motherIds } }, { babyProfileId: { in: babyIds } }] });
    const [records, dailies, babyDailies, plans, abnormalities, outreach, mAdm, mDis, bAdm, bDis, meds, versions, logs, docs, links] = await Promise.all([
        db.careRecord.count({ where: mOrB('motherProfileId') }),
        db.careDailyRecord.count({ where: { motherProfileId: { in: motherIds } } }),
        db.careDailyBabyRecord.count({ where: { babyProfileId: { in: babyIds } } }),
        db.carePlan.count({ where: mOrB('motherProfileId') }),
        db.careAbnormality.count({ where: mOrB('motherProfileId') }),
        db.careOutreachPlan.count({ where: { motherProfileId: { in: motherIds } } }),
        db.careMotherAdmission.count({ where: { motherProfileId: { in: motherIds } } }),
        db.careMotherDischarge.count({ where: { motherProfileId: { in: motherIds } } }),
        db.careBabyAdmission.count({ where: { babyProfileId: { in: babyIds } } }),
        db.careBabyDischarge.count({ where: { babyProfileId: { in: babyIds } } }),
        db.careMedicationAuth.count({ where: { motherProfileId: { in: motherIds } } }),
        db.carePlanVersion.count({ where: { motherProfileId: { in: motherIds } } }),
        db.careServiceLog.count({ where: { motherProfileId: { in: motherIds } } }),
        db.careDocument.count({ where: { motherProfileId: { in: motherIds } } }),
        db.careConfirmLink.count({ where: { motherProfileId: { in: motherIds } } }),
    ]);
    const blockers = [
        records && `${records} 条护理记录`,
        dailies + babyDailies > 0 && `${dailies + babyDailies} 条日常护理记录`,
        plans && `${plans} 个护理计划`,
        abnormalities && `${abnormalities} 条护理异常`,
        outreach && `${outreach} 个离店关怀计划`,
    ].filter(Boolean);
    const attached = [
        mAdm + bAdm > 0 && '入所评估表',
        mDis + bDis > 0 && '出所评估表',
        meds && `${meds} 份用药委托书`,
        versions && `${versions} 个护理计划版本`,
        logs && `${logs} 条服务执行记录`,
        docs && `${docs} 份纸质资料`,
        links && `${links} 个客户确认链接`,
    ].filter(Boolean);
    return { blockers, attached, babyCount: babyIds.length };
}
async function deleteMotherProfilesTx(tx, motherIds) {
    if (motherIds.length === 0)
        return [];
    const babies = await tx.babyProfile.findMany({ where: { motherProfileId: { in: motherIds } }, select: { id: true } });
    const babyIds = babies.map((b) => b.id);
    const docs = await tx.careDocument.findMany({ where: { motherProfileId: { in: motherIds } }, select: { id: true } });
    await tx.careMotherAdmission.deleteMany({ where: { motherProfileId: { in: motherIds } } });
    await tx.careMotherDischarge.deleteMany({ where: { motherProfileId: { in: motherIds } } });
    await tx.careBabyAdmission.deleteMany({ where: { babyProfileId: { in: babyIds } } });
    await tx.careBabyDischarge.deleteMany({ where: { babyProfileId: { in: babyIds } } });
    await tx.careMedicationAuth.deleteMany({ where: { motherProfileId: { in: motherIds } } });
    await tx.carePlanVersion.deleteMany({ where: { motherProfileId: { in: motherIds } } });
    await tx.careServiceLog.deleteMany({ where: { motherProfileId: { in: motherIds } } });
    await tx.careDocument.deleteMany({ where: { motherProfileId: { in: motherIds } } });
    await tx.careConfirmLink.deleteMany({ where: { motherProfileId: { in: motherIds } } });
    await tx.tagBinding.deleteMany({ where: { OR: [{ entityType: 'MOTHER_PROFILE', entityId: { in: motherIds } }, { entityType: 'BABY_PROFILE', entityId: { in: babyIds } }] } });
    await tx.babyProfile.deleteMany({ where: { motherProfileId: { in: motherIds } } });
    await tx.motherProfile.deleteMany({ where: { id: { in: motherIds } } });
    return docs.map((d) => d.id);
}
async function addProfileExtras(c) {
    await c.collectByIdColumn('tag_bindings', 'entity_id', c.idsOf('mother_profiles'), "entity_type = 'MOTHER_PROFILE'");
    await c.collectByIdColumn('tag_bindings', 'entity_id', c.idsOf('baby_profiles'), "entity_type = 'BABY_PROFILE'");
}
//# sourceMappingURL=profile-delete.util.js.map