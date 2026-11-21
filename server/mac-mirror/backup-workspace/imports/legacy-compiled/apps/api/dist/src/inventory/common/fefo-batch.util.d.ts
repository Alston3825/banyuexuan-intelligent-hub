import { Prisma } from '@prisma/client';
export interface ConsumedBatch {
    batchId: string;
    quantity: number;
    unitCost: number;
    receivedAt: Date;
    expiresAt: Date | null;
}
export declare function consumeBatchesFefo(tx: Prisma.TransactionClient, warehouseId: string, itemId: string, quantity: number): Promise<ConsumedBatch[]>;
