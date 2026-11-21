import { GoodsReceipt } from '@prisma/client';
import { InventoryItemImportService } from '../inventory-item/inventory-item-import.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { RequestContextService } from '../../common/context/request-context.service';
import { WorkflowEngineService } from '../../workflow/workflow-engine/workflow-engine.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { QueryGoodsReceiptDto } from './dto/query-goods-receipt.dto';
export interface ReceiveLineInput {
    receiptItemId: string;
    quantity: number;
    expiresAt?: string;
    note?: string;
}
export declare class GoodsReceiptService {
    private readonly prisma;
    private readonly workflowEngineService;
    private readonly auditLogService;
    private readonly ctx;
    private readonly itemImport;
    constructor(prisma: PrismaService, workflowEngineService: WorkflowEngineService, auditLogService: AuditLogService, ctx: RequestContextService, itemImport: InventoryItemImportService);
    findMany(query?: QueryGoodsReceiptDto): Promise<GoodsReceipt[]>;
    findOneOrThrow(id: string): Promise<GoodsReceipt>;
    private attachConfirmerNames;
    create(dto: CreateGoodsReceiptDto): Promise<GoodsReceipt>;
    submit(id: string, expectedVersion: number): Promise<GoodsReceipt>;
    cancel(id: string, cancelReason: string, expectedVersion: number): Promise<GoodsReceipt>;
    execute(id: string, expectedVersion: number): Promise<GoodsReceipt>;
    receive(id: string, input: {
        lines: ReceiveLineInput[];
        expressNo?: string;
        note?: string;
    }): unknown;
    closeShort(id: string, reason: string): unknown;
    private assertNotTracked;
    private stockIn;
    private reconcileStatus;
    private assertVersion;
    private actor;
    private auditCtx;
}
