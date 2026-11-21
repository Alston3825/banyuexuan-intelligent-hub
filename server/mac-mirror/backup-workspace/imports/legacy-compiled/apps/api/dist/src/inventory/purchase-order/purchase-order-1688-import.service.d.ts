import { PrismaService } from '../../prisma/prisma.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { PurchaseOrderLogisticsCore } from './purchase-order-logistics.core';
export interface Import1688Order {
    orderNo: string;
    seller: string;
    sellerMember: string;
    status: string;
    createdAt: string | null;
    goodsTotal: number;
    freight: number;
    paid: number;
    titles: string[];
    expressCompanyRaw: string;
    expressCompany: string | null;
    expressNos: string[];
}
export interface Import1688PoBrief {
    id: string;
    orderNo: string;
    supplierName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    itemsText: string;
    expressNo: string | null;
    platformOrderNo: string | null;
}
export interface Import1688Row {
    order: Import1688Order;
    confidence: 'high' | 'medium' | 'none';
    score: number;
    reasons: string[];
    match: Import1688PoBrief | null;
    alternatives: Import1688PoBrief[];
    alreadyLinked: boolean;
    notes: string[];
}
export interface Import1688CommitItem {
    purchaseOrderId: string;
    platformOrderNo: string;
    sellerName?: string | null;
    goodsTitle?: string | null;
    paid?: number;
    orderStatus?: string | null;
    expressCompany?: string | null;
    expressNos?: string[];
}
export declare const companyCodeOf: (raw: string) => string | null;
export declare class PurchaseOrder1688ImportService {
    private readonly prisma;
    private readonly ctx;
    private readonly core;
    constructor(prisma: PrismaService, ctx: RequestContextService, core: PurchaseOrderLogisticsCore);
    parse(buf: Buffer): Import1688Order[];
    preview(buf: Buffer): Promise<{
        rows: Import1688Row[];
        total: number;
    }>;
    commit(items: Import1688CommitItem[]): unknown;
}
