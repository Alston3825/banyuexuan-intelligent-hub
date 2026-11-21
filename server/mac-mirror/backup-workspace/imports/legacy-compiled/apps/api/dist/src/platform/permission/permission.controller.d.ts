import { PermissionService } from './permission.service';
export declare class PermissionController {
    private readonly permissionService;
    constructor(permissionService: PermissionService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{}>;
}
