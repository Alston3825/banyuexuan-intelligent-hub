import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { Kuaidi100Client } from './kuaidi100.client';
import { PurchaseOrderLogisticsCore } from './purchase-order-logistics.core';
export declare const PURCHASE_PLATFORMS: readonly ["1688", "TAOBAO", "PDD", "OTHER"];
export interface LogisticsInfoInput {
    platform?: string | null;
    platformOrderNo?: string | null;
    expressNo?: string | null;
    expressCompany?: string | null;
    expressPhoneTail?: string | null;
}
export declare class PurchaseOrderLogisticsService {
    private readonly prisma;
    private readonly audit;
    private readonly ctx;
    private readonly client;
    private readonly core;
    constructor(prisma: PrismaService, audit: AuditLogService, ctx: RequestContextService, client: Kuaidi100Client, core: PurchaseOrderLogisticsCore);
    meta(): {
        configured: boolean;
        companies: {};
        platforms: readonly ["1688", "TAOBAO", "PDD", "OTHER"];
        stateLabels: Record<number, string>;
    };
    private order;
    updateInfo(id: string, dto: LogisticsInfoInput): unknown;
    refresh(id: string): unknown;
    get(id: string): unknown;
    shipments(id: string): unknown;
    refreshShipments(id: string): unknown;
    refreshShipment(id: string, shipmentId: string): unknown;
}
