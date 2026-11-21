import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GrantPermissionDto } from './dto/grant-permission.dto';
declare class ChangePermissionsDto {
    grant: string[];
    revoke: string[];
}
export declare class RoleController {
    private readonly roleService;
    constructor(roleService: RoleService);
    findAll(): any;
    findOne(id: string): unknown;
    create(dto: CreateRoleDto): Promise<Role>;
    update(id: string, dto: UpdateRoleDto): Promise<Role>;
    remove(id: string): Promise<void>;
    changePermissions(id: string, dto: ChangePermissionsDto): unknown;
    defaultsPreview(id: string): unknown;
    restoreDefaults(id: string): unknown;
    grantPermission(id: string, dto: GrantPermissionDto): unknown;
    revokePermission(id: string, permissionPointId: string): any;
}
export {};
