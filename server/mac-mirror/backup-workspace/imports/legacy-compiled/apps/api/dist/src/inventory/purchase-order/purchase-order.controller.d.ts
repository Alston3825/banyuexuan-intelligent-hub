import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderLogisticsService } from './purchase-order-logistics.service';
import { Import1688CommitItem, PurchaseOrder1688ImportService } from './purchase-order-1688-import.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';
import { CancelPurchaseOrderDto } from './dto/cancel-purchase-order.dto';
import { VersionDto } from './dto/version.dto';
declare class LogisticsDto {
    platform?: string;
    platformOrderNo?: string;
    expressNo?: string;
    expressCompany?: string;
    expressPhoneTail?: string;
}
declare class Commit1688Dto {
    items: Import1688CommitItem[];
}
declare class ConfirmPurchaseDto {
    version: number;
    expressNo?: string;
    note?: string;
}
export declare class PurchaseOrderController {
    private readonly purchaseOrderService;
    private readonly logistics;
    private readonly import1688;
    constructor(purchaseOrderService: PurchaseOrderService, logistics: PurchaseOrderLogisticsService, import1688: PurchaseOrder1688ImportService);
    logisticsMeta(): {
        configured: boolean;
        companies: {};
        platforms: readonly ["1688", "TAOBAO", "PDD", "OTHER"];
        stateLabels: Record<number, string>;
    };
    import1688Preview(file?: Express.Multer.File): Promise<{
        rows: import("./purchase-order-1688-import.service").Import1688Row[];
        total: number;
    }>;
    import1688Commit(dto: Commit1688Dto): unknown;
    findAll(query: QueryPurchaseOrderDto): Promise<{}>;
    shipments(id: string): unknown;
    refreshShipments(id: string): unknown;
    refreshShipment(id: string, sid: string): unknown;
    getLogistics(id: string): unknown;
    updateLogistics(id: string, dto: LogisticsDto): unknown;
    refreshLogistics(id: string): unknown;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreatePurchaseOrderDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    submit(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    confirmPurchase(id: string, dto: ConfirmPurchaseDto): unknown;
    cancel(id: string, dto: CancelPurchaseOrderDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
export {};
