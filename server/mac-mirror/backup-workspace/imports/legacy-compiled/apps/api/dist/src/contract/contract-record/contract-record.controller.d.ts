import type { Response } from 'express';
import { ContractRecordService } from './contract-record.service';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ConfirmContractDto } from './dto/confirm-contract.dto';
import { VoidContractDto } from './dto/void-contract.dto';
import { QueryContractDto } from './dto/query-contract.dto';
import { CreateManualContractDto, UploadContractDto } from './dto/upload-contract.dto';
export declare class ContractRecordController {
    private readonly contractRecordService;
    constructor(contractRecordService: ContractRecordService);
    findAll(query: QueryContractDto): unknown;
    upload(files: Express.Multer.File[], dto: UploadContractDto): unknown;
    createManual(dto: CreateManualContractDto): unknown;
    findOne(id: string): unknown;
    customerMatches(id: string): Promise<{
        matches: import("./contract-record.service").CustomerMatch[];
        suggestedId: string | null;
    }>;
    file(id: string, fileId: string, res: Response): unknown;
    update(id: string, dto: UpdateContractDto): unknown;
    reextract(id: string): unknown;
    confirm(id: string, dto: ConfirmContractDto): unknown;
    void(id: string, dto: VoidContractDto): unknown;
    remove(id: string): unknown;
}
