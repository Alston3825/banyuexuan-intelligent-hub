import { PrismaService } from '../prisma/prisma.service';
export declare const CARE_RISK_CATEGORY = "CARE_RISK";
export declare function replaceRiskTags(prisma: PrismaService, p: {
    tenantId: string;
    accountId: string;
    entityType: 'MOTHER_PROFILE' | 'BABY_PROFILE';
    entityId: string;
    tagIds: string[];
}): Promise<{
    added: string[];
    removed: string[];
}>;
