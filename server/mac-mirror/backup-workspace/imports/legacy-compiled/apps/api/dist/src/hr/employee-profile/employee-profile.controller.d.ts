import { EmployeeProfileService } from './employee-profile.service';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { QueryEmployeeProfileDto } from './dto/query-employee-profile.dto';
declare class ArchiveEmployeeDto {
    terminationDate?: string;
    reason?: string;
    version: number;
}
declare class RestoreEmployeeDto {
    employeeNo?: string;
    version: number;
}
export declare class EmployeeProfileController {
    private readonly employeeProfileService;
    constructor(employeeProfileService: EmployeeProfileService);
    findAll(query: QueryEmployeeProfileDto): unknown;
    nextNo(storeId?: string): any;
    expiryAlerts(withinDays?: string): unknown;
    findOne(id: string): unknown;
    create(dto: CreateEmployeeProfileDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
    archive(id: string, dto: ArchiveEmployeeDto): unknown;
    restore(id: string, dto: RestoreEmployeeDto): unknown;
    update(id: string, dto: UpdateEmployeeProfileDto): Promise<Array<S & import("@prisma/client/runtime/library").UnwrapPayload<C>>>;
}
export {};
