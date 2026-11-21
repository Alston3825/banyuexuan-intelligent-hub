import { PurchaseRequest } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { DataScopeService } from '../../common/scope/data-scope.service';
import { WorkflowEngineService } from '../../workflow/workflow-engine/workflow-engine.service';
import { PurchaseOrderService } from '../purchase-order/purchase-order.service';
import { InventoryItemImportService } from '../inventory-item/inventory-item-import.service';
export interface RequestLineBody {
    name?: string;
    spec?: string | null;
    brand?: string | null;
    unit?: string | null;
    quantity?: number;
    unitPrice?: number | null;
    department?: string | null;
    requester?: string | null;
    purpose?: string | null;
    remark?: string | null;
    itemId?: string | null;
}
export declare class PurchaseRequestService {
    private readonly prisma;
    private readonly workflowEngineService;
    private readonly purchaseOrderService;
    private readonly auditLogService;
    private readonly dataScope;
    private readonly ctx;
    private readonly itemImport;
    constructor(prisma: PrismaService, workflowEngineService: WorkflowEngineService, purchaseOrderService: PurchaseOrderService, auditLogService: AuditLogService, dataScope: DataScopeService, ctx: RequestContextService, itemImport: InventoryItemImportService);
    private isProcurementStaff;
    private withCreatorNames;
    findMany(query?: {
        storeId?: string;
        status?: PurchaseRequest['status'];
        kind?: PurchaseRequest['kind'];
    }): unknown;
    findOneOrThrow(id: string): unknown;
    private isCurrentApprover;
    detail(id: string): unknown;
    createManual(body: {
        storeId: string;
        requestDate?: string;
        remark?: string;
        items: RequestLineBody[];
        createMissingItems?: boolean;
    }): unknown;
    createDepartment(body: {
        storeId?: string;
        requestDate?: string;
        remark?: string;
        items: RequestLineBody[];
        submit?: boolean;
    }): unknown;
    recall(id: string, expectedVersion: number): unknown;
    collect(ids: string[], remark?: string): unknown;
    private draftOrThrow;
    private auditLineChange;
    private resolveItem;
    private normalize;
    private recalc;
    addLine(id: string, body: RequestLineBody, expectedVersion: number): unknown;
    updateLine(id: string, lineId: string, body: RequestLineBody, expectedVersion: number): unknown;
    removeLine(id: string, lineId: string, expectedVersion: number): unknown;
    submit(id: string, expectedVersion: number): unknown;
    cancel(id: string, cancelReason: string, expectedVersion: number): unknown;
    convert(id: string, input: {
        supplierId: string;
        warehouseId: string;
        fixes?: {
            lineId: string;
            unitPrice?: number;
            itemId?: string;
        }[];
    }, expectedVersion: number): unknown;
    private reconcileStatus;
    private assertVersion;
    private audit;
    private actor;
}
