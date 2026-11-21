import { AccountService } from './account.service';
import { AccountImportService, ImportRow } from './account-import.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
declare class CommitImportDto {
    rows: ImportRow[];
    storeId: string;
    createMissing: boolean;
    roleId?: string;
    importProfileDetails: boolean;
}
export declare class AccountController {
    private readonly accountService;
    private readonly importService;
    constructor(accountService: AccountService, importService: AccountImportService);
    importPreview(file?: Express.Multer.File): Promise<import("./account-import.service").ImportPreview>;
    importCommit(dto: CommitImportDto): unknown;
    findAll(): unknown;
    findOne(id: string): unknown;
    create(dto: CreateAccountDto): unknown;
    update(id: string, dto: UpdateAccountDto): unknown;
    resetPassword(id: string, dto: ResetPasswordDto): Promise<void>;
    assignRole(id: string, dto: AssignRoleDto): unknown;
    revokeRoleAssignment(id: string, assignmentId: string): unknown;
    remove(id: string): Promise<void>;
}
export {};
