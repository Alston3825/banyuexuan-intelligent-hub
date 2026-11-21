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
exports.DataScopeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DataScopeService = class DataScopeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveAllowedStoreIds(ctx) {
        const grants = await ctx.getScopeGrants();
        if (grants.some((g) => g.scopeType === 'TENANT'))
            return 'ALL';
        const storeIdSets = [];
        for (const grant of grants) {
            if (!grant.scopeId)
                continue;
            switch (grant.scopeType) {
                case 'REGION': {
                    const stores = await this.prisma.store.findMany({
                        where: { regionId: grant.scopeId },
                        select: { id: true },
                    });
                    storeIdSets.push(stores.map((s) => s.id));
                    break;
                }
                case 'STORE':
                    storeIdSets.push([grant.scopeId]);
                    break;
                case 'DEPARTMENT': {
                    const dept = await this.prisma.department.findUnique({
                        where: { id: grant.scopeId },
                        select: { storeId: true },
                    });
                    if (dept?.storeId)
                        storeIdSets.push([dept.storeId]);
                    break;
                }
                case 'TEAM': {
                    const team = await this.prisma.team.findUnique({
                        where: { id: grant.scopeId },
                        select: { storeId: true },
                    });
                    if (team?.storeId)
                        storeIdSets.push([team.storeId]);
                    break;
                }
                case 'SELF':
                    break;
            }
        }
        return Array.from(new Set(storeIdSets.flat()));
    }
    async assertStoreAccessible(ctx, storeId) {
        if (!storeId)
            return;
        const allowed = await this.resolveAllowedStoreIds(ctx);
        if (allowed === 'ALL')
            return;
        if (!allowed.includes(storeId)) {
            throw new common_1.ForbiddenException('无权访问该门店范围内的数据');
        }
    }
    async hasOnlySelfScope(ctx) {
        const grants = await ctx.getScopeGrants();
        return grants.length > 0 && grants.every((g) => g.scopeType === 'SELF');
    }
};
exports.DataScopeService = DataScopeService;
exports.DataScopeService = DataScopeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DataScopeService);
//# sourceMappingURL=data-scope.service.js.map