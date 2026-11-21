import { PayrollRecordService } from './payroll-record.service';
import { CreatePayrollRecordDto } from './dto/create-payroll-record.dto';
import { QueryPayrollRecordDto } from './dto/query-payroll-record.dto';
import { CancelPayrollRecordDto } from './dto/cancel-payroll-record.dto';
import { VersionDto } from './dto/version.dto';
export declare class PayrollRecordController {
    private readonly payrollRecordService;
    constructor(payrollRecordService: PayrollRecordService);
    findAll(query: QueryPayrollRecordDto): Promise<{}>;
    findOne(id: string): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    create(dto: CreatePayrollRecordDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    submit(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    markPaid(id: string, dto: VersionDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    cancel(id: string, dto: CancelPayrollRecordDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
