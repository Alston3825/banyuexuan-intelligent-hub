import { PurchaseOrder } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { WorkflowEngineService } from '../../workflow/workflow-engine/workflow-engine.service';
import { InventoryItemImportService } from '../inventory-item/inventory-item-import.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';
export declare class PurchaseOrderService {
    private readonly prisma;
    private readonly workflowEngineService;
    private readonly auditLogService;
    private readonly ctx;
    private readonly itemImport;
    constructor(prisma: PrismaService, workflowEngineService: WorkflowEngineService, auditLogService: AuditLogService, ctx: RequestContextService, itemImport: InventoryItemImportService);
    findMany(query?: QueryPurchaseOrderDto): Promise<PurchaseOrder[]>;
    findOneOrThrow(id: string): Promise<PurchaseOrder>;
    create(dto: CreatePurchaseOrderDto, opts?: {
        autoApprove?: boolean;
    }): Promise<PurchaseOrder>;
    confirmPurchase(id: string, input: {
        expressNo?: string;
        note?: string;
    }, expectedVersion: number): unknown;
    submit(id: string, expectedVersion: number): Promise<PurchaseOrder>;
    cancel(id: string, cancelReason: string, expectedVersion: number): Promise<PurchaseOrder>;
    private reconcileStatus;
    private assertVersion;
    private actor;
    private auditCtx;
}
