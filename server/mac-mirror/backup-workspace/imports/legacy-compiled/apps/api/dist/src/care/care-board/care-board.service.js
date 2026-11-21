"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareBoardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const request_context_service_1 = require("../../common/context/request-context.service");
const room_service_1 = require("../../room/room/room.service");
let CareBoardService = class CareBoardService {
    prisma;
    roomService;
    ctx;
    constructor(prisma, roomService, ctx) {
        this.prisma = prisma;
        this.roomService = roomService;
        this.ctx = ctx;
    }
    async getBoard(query) {
        const entries = await this.roomService.getBoard(query);
        const occupancyIds = entries.map((e) => e.occupancyId).filter((id) => !!id);
        if (occupancyIds.length === 0) {
            return entries.map((e) => ({ ...e, care: null }));
        }
        const profiles = await this.prisma.motherProfile.findMany({
            where: { tenantId: this.ctx.tenantId, occupancyId: { in: occupancyIds } },
            include: { babies: { orderBy: { sequenceNo: 'asc' } }, primaryNurse: { select: { id: true, realName: true } } },
        });
        const profileByOccupancyId = new Map(profiles.map((p) => [p.occupancyId, p]));
        const motherProfileIds = profiles.map((p) => p.id);
        const allergyBindings = motherProfileIds.length > 0
            ? await this.prisma.tagBinding.findMany({
                where: { entityType: 'MOTHER_PROFILE', entityId: { in: motherProfileIds }, revokedAt: null, tag: { name: '高敏' } },
                select: { entityId: true },
            })
            : [];
        const allergyMotherProfileIds = new Set(allergyBindings.map((b) => b.entityId));
        const admissions = motherProfileIds.length
            ? await this.prisma.careMotherAdmission.findMany({
                where: { tenantId: this.ctx.tenantId, motherProfileId: { in: motherProfileIds } },
                select: { motherProfileId: true, allergyHistory: true, allergyNote: true },
            })
            : [];
        const NO_ALLERGY_TEXT = /^(无|没有|否|无过敏|未见|\/|-|—)$/;
        const allergyByProfile = new Map(admissions.map((a) => {
            const note = a.allergyNote?.trim() || null;
            const noteMeansAllergy = !!note && !NO_ALLERGY_TEXT.test(note);
            return [a.motherProfileId, { flag: a.allergyHistory === 'YES' || noteMeansAllergy, note: noteMeansAllergy ? note : null }];
        }));
        const today = new Date(`${new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10)}T00:00:00.000Z`);
        const dailyToday = motherProfileIds.length
            ? await this.prisma.careDailyRecord.findMany({ where: { motherProfileId: { in: motherProfileIds }, recordDate: today }, select: { motherProfileId: true } })
            : [];
        const dailyFilled = new Set(dailyToday.map((r) => r.motherProfileId));
        const activePlans = motherProfileIds.length
            ? await this.prisma.carePlanVersion.findMany({ where: { tenantId: this.ctx.tenantId, motherProfileId: { in: motherProfileIds }, babyProfileId: null, status: 'ACTIVE' } })
            : [];
        const planByMother = new Map(activePlans.map((p) => [p.motherProfileId, p]));
        return entries.map((entry) => {
            const profile = entry.occupancyId ? profileByOccupancyId.get(entry.occupancyId) : undefined;
            if (!profile)
                return { ...entry, care: null };
            return {
                ...entry,
                care: {
                    motherProfileId: profile.id,
                    deliveryMethod: profile.deliveryMethod,
                    deliveryDate: profile.deliveryDate,
                    gestationalWeeks: profile.gestationalWeeks,
                    careNote: profile.careNote,
                    nurse: profile.primaryNurse ? { id: profile.primaryNurse.id, name: profile.primaryNurse.realName } : null,
                    ...this.allergyOf(profile.allergens, allergyMotherProfileIds.has(profile.id), allergyByProfile.get(profile.id)),
                    dailyFilledToday: dailyFilled.has(profile.id),
                    plan: planByMother.has(profile.id)
                        ? {
                            level: planByMother.get(profile.id).level,
                            focusPoints: planByMother.get(profile.id).focusPoints,
                            nextReviewDue: planByMother.get(profile.id).nextReviewDue ? planByMother.get(profile.id).nextReviewDue.toISOString().slice(0, 10) : null,
                            reviewOverdue: !!planByMother.get(profile.id).nextReviewDue && planByMother.get(profile.id).nextReviewDue <= today,
                        }
                        : null,
                    babies: profile.babies.map((b) => ({ id: b.id, sequenceNo: b.sequenceNo, name: b.name, gender: b.gender })),
                },
            };
        });
    }
    allergyOf(allergens, hasTag, fromAssessment) {
        const text = allergens?.trim() || null;
        if (text) {
            const means = !/^(无|没有|否|无过敏|未见|\/|-|—)$/.test(text);
            return { hasAllergyTag: means || hasTag, allergyNote: means ? text : null };
        }
        return { hasAllergyTag: hasTag || !!fromAssessment?.flag, allergyNote: fromAssessment?.note ?? null };
    }
};
exports.CareBoardService = CareBoardService;
exports.CareBoardService = CareBoardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        room_service_1.RoomService,
        request_context_service_1.RequestContextService])
], CareBoardService);
//# sourceMappingURL=care-board.service.js.map