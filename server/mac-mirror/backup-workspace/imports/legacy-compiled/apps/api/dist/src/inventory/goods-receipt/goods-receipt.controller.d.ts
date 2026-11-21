import { GoodsReceiptService } from './goods-receipt.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { QueryGoodsReceiptDto } from './dto/query-goods-receipt.dto';
import { CancelGoodsReceiptDto } from './dto/cancel-goods-receipt.dto';
import { VersionDto } from './dto/version.dto';
declare class ReceiveLineDto {
    receiptItemId: string;
    quantity: number;
    expiresAt?: string;
    note?: string;
}
declare class ReceiveDto {
    lines: ReceiveLineDto[];
    expressNo?: string;
    note?: string;
}
declare class CloseShortDto {
    reason: string;
}
export declare class GoodsReceiptController {
    private readonly goodsReceiptService;
    constructor(goodsReceiptService: GoodsReceiptService);
    findAll(query: QueryGoodsReceiptDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateGoodsReceiptDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    submit(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    execute(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    receive(id: string, dto: ReceiveDto): unknown;
    closeShort(id: string, dto: CloseShortDto): unknown;
    cancel(id: string, dto: CancelGoodsReceiptDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
export {};
