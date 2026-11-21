import { CommissionRecordService } from './commission-record.service';
import { CreateCommissionRecordDto } from './dto/create-commission-record.dto';
import { QueryCommissionRecordDto } from './dto/query-commission-record.dto';
import { CancelCommissionRecordDto } from './dto/cancel-commission-record.dto';
import { VersionDto } from './dto/version.dto';
export declare class CommissionRecordController {
    private readonly commissionRecordService;
    constructor(commissionRecordService: CommissionRecordService);
    findAll(query: QueryCommissionRecordDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreateCommissionRecordDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    submit(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    cancel(id: string, dto: CancelCommissionRecordDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
