import { Body } from '@nestjs/common';
import { CareRecordService } from './care-record.service';
import { CreateCareRecordDto } from './dto/create-care-record.dto';
import { QueryCareRecordDto } from './dto/query-care-record.dto';
export declare class CareRecordController {
    private readonly careRecordService;
    constructor(careRecordService: CareRecordService);
    findAll(query: QueryCareRecordDto): any;
    findOne(id: string): unknown;
    create(dto: CreateCareRecordDto): Promise<{
        record: Body;
        abnormalities: Body[];
    }>;
}
